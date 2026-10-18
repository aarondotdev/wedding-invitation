// Guest list tooling. Run via `npm run guests -- <command>` (loads .env.local).
//
//   import <file.csv>   Add guests from a CSV (name, party_size, phone, email, notes); existing names are skipped
//   export [outDir]     Write links.csv + one QR code PNG per active guest (default: invites/)
//   list                Print every guest with their link and RSVP status
//   revoke <code>       Disable a link
//   restore <code>      Re-enable a revoked link
//   reissue <code>      Give the guest a new code (old link stops working, RSVP is kept)

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import QRCode from "qrcode";

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  fail("SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env.local");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const inviteUrl = (code) => `${SITE_URL}/i/${code}`;

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function check({ data, error }) {
  if (error) fail(error.message);
  return data;
}

function csvCell(value) {
  const s = value == null ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

function fileSafe(name) {
  return name.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "guest";
}

async function importGuests(file) {
  if (!file) fail("usage: import <file.csv>");

  const rows = parse(await readFile(file), {
    columns: (header) => header.map((h) => h.trim().toLowerCase()),
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  const existing = check(await supabase.from("guests").select("name"));
  const seen = new Set(existing.map((g) => g.name.toLowerCase()));

  const toInsert = [];
  let skipped = 0;
  rows.forEach((row, i) => {
    const line = i + 2; // header is line 1
    const name = row.name ?? "";
    const partySize = row.party_size ? Number(row.party_size) : 1;

    if (!name) {
      console.warn(`Line ${line}: missing name, skipped`);
      return;
    }
    if (!Number.isInteger(partySize) || partySize < 1 || partySize > 20) {
      console.warn(`Line ${line}: party_size must be 1–20 (got "${row.party_size}"), skipped`);
      return;
    }
    if (seen.has(name.toLowerCase())) {
      skipped++;
      return;
    }
    seen.add(name.toLowerCase());
    toInsert.push({
      name,
      party_size: partySize,
      phone: row.phone || null,
      email: row.email || null,
      notes: row.notes || null,
    });
  });

  if (toInsert.length) check(await supabase.from("guests").insert(toInsert));
  console.log(`Inserted ${toInsert.length} guest(s), skipped ${skipped} already in the list.`);
}

async function exportLinks(outDir = "invites") {
  const guests = check(
    await supabase
      .from("guests")
      .select("name, phone, email, party_size, code")
      .is("revoked_at", null)
      .order("name"),
  );

  const qrDir = path.join(outDir, "qr");
  await mkdir(qrDir, { recursive: true });

  const lines = [["name", "phone", "email", "party_size", "url"].join(",")];
  for (const g of guests) {
    const url = inviteUrl(g.code);
    lines.push([g.name, g.phone, g.email, g.party_size, url].map(csvCell).join(","));
    // Code suffix keeps filenames unique when two guests share a name
    await QRCode.toFile(path.join(qrDir, `${fileSafe(g.name)}-${g.code.slice(0, 4)}.png`), url, {
      width: 600,
      margin: 2,
    });
  }

  // BOM so Excel opens accented names correctly
  await writeFile(path.join(outDir, "links.csv"), "﻿" + lines.join("\n") + "\n");
  console.log(`Exported ${guests.length} link(s) to ${path.join(outDir, "links.csv")} and QR codes to ${qrDir}`);
  if (SITE_URL.includes("localhost")) {
    console.warn("Warning: links use localhost. Set NEXT_PUBLIC_SITE_URL to your real domain before sending.");
  }
}

async function listGuests() {
  const guests = check(
    await supabase
      .from("guests")
      .select("name, party_size, code, attending, guest_count, opened_at, revoked_at")
      .order("name"),
  );
  for (const g of guests) {
    const rsvp = g.attending === null ? "no reply" : g.attending ? `yes (${g.guest_count})` : "no";
    const flags = [g.revoked_at && "REVOKED", g.opened_at ? "opened" : "not opened"].filter(Boolean);
    console.log(`${g.name} [${g.party_size}] — ${rsvp} — ${flags.join(", ")} — ${inviteUrl(g.code)}`);
  }
  console.log(`${guests.length} guest(s)`);
}

async function findByCode(code) {
  if (!code) fail("a code is required");
  const guest = check(await supabase.from("guests").select("id, name").eq("code", code).maybeSingle());
  if (!guest) fail(`no guest with code ${code}`);
  return guest;
}

async function setRevoked(code, revoked) {
  const guest = await findByCode(code);
  check(
    await supabase
      .from("guests")
      .update({ revoked_at: revoked ? new Date().toISOString() : null })
      .eq("id", guest.id),
  );
  console.log(`${revoked ? "Revoked" : "Restored"} link for ${guest.name}`);
}

async function reissue(code) {
  const guest = await findByCode(code);
  const newCode = check(await supabase.rpc("generate_invite_code"));
  check(await supabase.from("guests").update({ code: newCode, revoked_at: null }).eq("id", guest.id));
  console.log(`New link for ${guest.name}: ${inviteUrl(newCode)}`);
}

const [command, arg] = process.argv.slice(2);
const commands = {
  import: () => importGuests(arg),
  export: () => exportLinks(arg),
  list: () => listGuests(),
  revoke: () => setRevoked(arg, true),
  restore: () => setRevoked(arg, false),
  reissue: () => reissue(arg),
};

if (!commands[command]) {
  fail(`unknown command "${command ?? ""}". Use one of: ${Object.keys(commands).join(", ")}`);
}
await commands[command]();
