import "server-only";

import { cache } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Guest = {
  id: string;
  code: string;
  name: string;
  party_size: number;
  attending: boolean | null;
  guest_count: number | null;
  message: string | null;
  responded_at: string | null;
  opened_at: string | null;
};

// Columns safe to load for rendering; private fields (phone, email, notes) stay in the DB.
const GUEST_COLUMNS =
  "id, code, name, party_size, attending, guest_count, message, responded_at, opened_at";

const CODE_PATTERN = /^[A-Za-z0-9_-]{12}$/;

let client: SupabaseClient | undefined;

// Uses the secret key, which bypasses RLS — only ever import this from server code.
export function supabaseAdmin() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) {
      throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set");
    }
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

// Returns null for malformed, unknown or revoked codes.
export const getGuestByCode = cache(async (code: string): Promise<Guest | null> => {
  if (!CODE_PATTERN.test(code)) return null;

  const { data, error } = await supabaseAdmin()
    .from("guests")
    .select(GUEST_COLUMNS)
    .eq("code", code)
    .is("revoked_at", null)
    .maybeSingle();

  if (error) throw error;
  return data;
});

export async function markOpened(guest: Guest) {
  if (guest.opened_at) return;
  await supabaseAdmin()
    .from("guests")
    .update({ opened_at: new Date().toISOString() })
    .eq("id", guest.id)
    .is("opened_at", null);
}
