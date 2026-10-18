"use server";

import { parse as parseCsv } from "csv-parse/sync";
import { refresh } from "next/cache";
import { readSheet } from "read-excel-file/node";
import { requireAdmin } from "@/lib/auth";
import {
  existingNames,
  inviteUrl,
  validateGuestRow,
  type GuestInput,
} from "@/lib/guests";
import { supabaseAdmin } from "@/lib/supabase";

export type FormState =
  | { status: "idle" }
  | { status: "success"; message: string; url?: string }
  | { status: "error"; message: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertId(id: string) {
  if (!UUID.test(id)) throw new Error("Invalid guest id");
}

const formFields = (formData: FormData) => ({
  name: formData.get("name"),
  party_size: formData.get("party_size"),
  phone: formData.get("phone"),
  email: formData.get("email"),
  notes: formData.get("notes"),
});

export async function addGuest(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const result = validateGuestRow(formFields(formData));
  if (!result.ok) return { status: "error", message: `Couldn't add guest: ${result.error}.` };

  if ((await existingNames()).has(result.guest.name.toLowerCase())) {
    return { status: "error", message: `${result.guest.name} is already on the guest list.` };
  }

  const { data, error } = await supabaseAdmin()
    .from("guests")
    .insert(result.guest)
    .select("code")
    .single();
  if (error) return { status: "error", message: error.message };

  refresh();
  return { status: "success", message: `Added ${result.guest.name}.`, url: inviteUrl(data.code) };
}

export async function updateGuest(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  assertId(id);

  const result = validateGuestRow(formFields(formData));
  if (!result.ok) return { status: "error", message: `Couldn't save: ${result.error}.` };

  const db = supabaseAdmin();
  const { data: current, error: readError } = await db
    .from("guests")
    .select("name, guest_count, attending")
    .eq("id", id)
    .single();
  if (readError) return { status: "error", message: readError.message };

  if (current.attending && (current.guest_count ?? 0) > result.guest.party_size) {
    return {
      status: "error",
      message: `They've already RSVP'd for ${current.guest_count}. Party size can't be lower than that.`,
    };
  }
  if (
    result.guest.name.toLowerCase() !== current.name.toLowerCase() &&
    (await existingNames()).has(result.guest.name.toLowerCase())
  ) {
    return { status: "error", message: `${result.guest.name} is already on the guest list.` };
  }

  const { error } = await db.from("guests").update(result.guest).eq("id", id);
  if (error) return { status: "error", message: error.message };

  refresh();
  return { status: "success", message: "Saved." };
}

export async function setRevoked(id: string, revoked: boolean) {
  await requireAdmin();
  assertId(id);
  const { error } = await supabaseAdmin()
    .from("guests")
    .update({ revoked_at: revoked ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
  refresh();
}

export async function reissueGuest(id: string) {
  await requireAdmin();
  assertId(id);
  const db = supabaseAdmin();
  const { data: code, error: codeError } = await db.rpc("generate_invite_code");
  if (codeError) throw codeError;
  const { error } = await db.from("guests").update({ code, revoked_at: null }).eq("id", id);
  if (error) throw error;
  refresh();
}

export async function deleteGuest(id: string) {
  await requireAdmin();
  assertId(id);
  const { error } = await supabaseAdmin().from("guests").delete().eq("id", id);
  if (error) throw error;
  refresh();
}

// ---------------------------------------------------------------------------
// Bulk import
// ---------------------------------------------------------------------------

export type PreviewRow =
  | { line: number; status: "ready"; guest: GuestInput }
  | { line: number; status: "duplicate" | "invalid"; name: string; reason: string };

export type ImportState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "preview"; fileName: string; rows: PreviewRow[] }
  | { status: "done"; inserted: number; skipped: { name: string; reason: string }[] };

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 1000;

const HEADER_ALIASES: Record<keyof GuestInput, string[]> = {
  name: ["name", "names", "guest", "guest name", "full name"],
  party_size: ["party size", "partysize", "seats", "guests", "pax", "size", "number of guests", "no of guests"],
  phone: ["phone", "mobile", "phone number", "mobile number", "contact", "contact number", "cell"],
  email: ["email", "e mail", "email address"],
  notes: ["notes", "note", "remarks", "comment", "comments"],
};

const normalizeHeader = (h: unknown) =>
  String(h ?? "").toLowerCase().replace(/[_\-.]/g, " ").replace(/\s+/g, " ").trim();

async function readRows(file: File): Promise<unknown[][]> {
  const buffer = Buffer.from(await file.arrayBuffer());
  if (/\.xlsx$/i.test(file.name)) return readSheet(buffer);
  return parseCsv(buffer, { bom: true, skip_empty_lines: true, relax_column_count: true, trim: true });
}

export async function previewImport(_prev: ImportState, formData: FormData): Promise<ImportState> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose an .xlsx or .csv file to upload." };
  }
  if (!/\.(xlsx|csv)$/i.test(file.name)) {
    return { status: "error", message: "Only .xlsx and .csv files are supported. In Excel, use Save As → Excel Workbook (.xlsx)." };
  }
  if (file.size > MAX_BYTES) {
    return { status: "error", message: "That file is over 2 MB. Split it into smaller files." };
  }

  let table: unknown[][];
  try {
    table = await readRows(file);
  } catch {
    return { status: "error", message: "Couldn't read that file. Make sure it's a valid .xlsx or .csv." };
  }

  const [header = [], ...body] = table;
  const columns = header.map(normalizeHeader);
  const index = Object.fromEntries(
    Object.entries(HEADER_ALIASES).map(([key, aliases]) => [
      key,
      columns.findIndex((c) => c === key.replace("_", " ") || aliases.includes(c)),
    ]),
  ) as Record<keyof GuestInput, number>;

  if (index.name === -1) {
    return {
      status: "error",
      message: "Couldn't find a “name” column. The first row should be headers: name, party_size, phone, email, notes.",
    };
  }

  const dataRows = body
    .map((cells, i) => ({ cells, line: i + 2 }))
    .filter(({ cells }) => cells.some((c) => c != null && String(c).trim() !== ""));
  if (dataRows.length > MAX_ROWS) {
    return { status: "error", message: `That file has ${dataRows.length} rows. The limit is ${MAX_ROWS} per import.` };
  }

  const seen = await existingNames();
  const inFile = new Set<string>();
  const cell = (cells: unknown[], key: keyof GuestInput) =>
    index[key] === -1 ? null : cells[index[key]];

  const rows: PreviewRow[] = dataRows.map(({ cells, line }) => {
    const raw = {
      name: cell(cells, "name"),
      party_size: cell(cells, "party_size"),
      phone: cell(cells, "phone"),
      email: cell(cells, "email"),
      notes: cell(cells, "notes"),
    };
    const result = validateGuestRow(raw);
    const name = String(raw.name ?? "").trim();
    if (!result.ok) return { line, status: "invalid", name, reason: result.error };

    const key = result.guest.name.toLowerCase();
    if (seen.has(key)) return { line, status: "duplicate", name, reason: "already on the guest list" };
    if (inFile.has(key)) return { line, status: "duplicate", name, reason: "repeated in this file" };
    inFile.add(key);
    return { line, status: "ready", guest: result.guest };
  });

  if (!rows.length) return { status: "error", message: "That file has headers but no guest rows." };
  return { status: "preview", fileName: file.name, rows };
}

// Rows come back from the browser, so they're validated and de-duplicated again.
export async function commitImport(guests: GuestInput[]): Promise<ImportState> {
  await requireAdmin();
  if (!Array.isArray(guests) || guests.length > MAX_ROWS) {
    return { status: "error", message: "Invalid import." };
  }

  const seen = await existingNames();
  const toInsert: GuestInput[] = [];
  const skipped: { name: string; reason: string }[] = [];

  for (const raw of guests) {
    const result = validateGuestRow(raw ?? {});
    const name = String(raw?.name ?? "").trim();
    if (!result.ok) {
      skipped.push({ name, reason: result.error });
      continue;
    }
    const key = result.guest.name.toLowerCase();
    if (seen.has(key)) {
      skipped.push({ name, reason: "already on the guest list" });
      continue;
    }
    seen.add(key);
    toInsert.push(result.guest);
  }

  if (toInsert.length) {
    const { error } = await supabaseAdmin().from("guests").insert(toInsert);
    if (error) return { status: "error", message: error.message };
  }

  refresh();
  return { status: "done", inserted: toInsert.length, skipped };
}
