import "server-only";

import { supabaseAdmin } from "@/lib/supabase";

export type AdminGuest = {
  id: string;
  code: string;
  name: string;
  party_size: number;
  phone: string | null;
  email: string | null;
  notes: string | null;
  attending: boolean | null;
  guest_count: number | null;
  message: string | null;
  responded_at: string | null;
  opened_at: string | null;
  revoked_at: string | null;
};

export type GuestInput = {
  name: string;
  party_size: number;
  phone: string | null;
  email: string | null;
  notes: string | null;
};

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const inviteUrl = (code: string) => `${SITE_URL}/i/${code}`;

export async function listGuests(): Promise<AdminGuest[]> {
  const { data, error } = await supabaseAdmin()
    .from("guests")
    .select(
      "id, code, name, party_size, phone, email, notes, attending, guest_count, message, responded_at, opened_at, revoked_at",
    )
    .order("name");
  if (error) throw error;
  return data;
}

export function guestStats(guests: AdminGuest[]) {
  const active = guests.filter((g) => !g.revoked_at);
  return {
    invited: active.length,
    seats: active.reduce((sum, g) => sum + g.party_size, 0),
    attending: active.reduce((sum, g) => sum + (g.attending ? (g.guest_count ?? 0) : 0), 0),
    declined: active.filter((g) => g.attending === false).length,
    awaiting: active.filter((g) => g.attending === null).length,
    opened: active.filter((g) => g.opened_at).length,
  };
}

const clean = (value: unknown, max: number) => {
  const s = value == null ? "" : String(value).trim();
  return s ? s.slice(0, max) : null;
};

// Validates a guest from a form or spreadsheet row. Returns the cleaned input or an error.
export function validateGuestRow(raw: {
  name?: unknown;
  party_size?: unknown;
  phone?: unknown;
  email?: unknown;
  notes?: unknown;
}): { ok: true; guest: GuestInput } | { ok: false; error: string } {
  const name = clean(raw.name, 200);
  if (!name) return { ok: false, error: "name is required" };

  const sizeText = raw.party_size == null ? "" : String(raw.party_size).trim();
  const party_size = sizeText === "" ? 1 : Number(sizeText);
  if (!Number.isInteger(party_size) || party_size < 1 || party_size > 20) {
    return { ok: false, error: "party size must be 1–20" };
  }

  const email = clean(raw.email, 320);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "email looks invalid" };
  }

  return {
    ok: true,
    guest: { name, party_size, phone: clean(raw.phone, 50), email, notes: clean(raw.notes, 1000) },
  };
}

export async function existingNames(): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin().from("guests").select("name");
  if (error) throw error;
  return new Set(data.map((g) => g.name.toLowerCase()));
}

function csvCell(value: unknown) {
  const s = value == null ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export function toCsv(rows: unknown[][]) {
  // BOM so Excel opens accented names correctly
  return "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\n") + "\n";
}
