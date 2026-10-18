import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/auth";
import { createAuthClient } from "@/lib/supabase-server";

// Handles the sign-in link in the email: /auth/confirm?token_hash=...&type=email
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (!tokenHash || !type) return to("/admin/login?error=link-invalid");

  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) return to("/admin/login?error=link-invalid");

  if (!isAdminEmail(data.user?.email)) {
    await supabase.auth.signOut();
    return to("/admin/login?error=not-allowed");
  }
  return to("/admin/guests");
}
