import "server-only";

import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase-server";

export function isAdminEmail(email: string | undefined | null) {
  if (!email) return false;
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

// Returns the signed-in admin's email, or null. getClaims() verifies the JWT signature;
// the email claim comes from Supabase Auth, not user-editable metadata.
export async function getAdminEmail() {
  const supabase = await createAuthClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email as string | undefined;
  return isAdminEmail(email) ? email! : null;
}

// Call at the top of every admin page, Server Action and route handler.
export async function requireAdmin() {
  const supabase = await createAuthClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email as string | undefined;

  if (!data?.claims) redirect("/admin/login");
  if (!isAdminEmail(email)) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=not-allowed");
  }
  return email!;
}
