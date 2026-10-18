"use server";

import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/auth";
import { createAuthClient } from "@/lib/supabase-server";

export type LoginState =
  | { step: "email"; error?: string }
  | { step: "code"; email: string; error?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export async function sendCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { step: "email", error: "Please enter a valid email address." };
  }

  // Only allowlisted emails get a code, but every email sees the same next step,
  // so the form can't be used to discover who is an admin.
  if (isAdminEmail(email)) {
    const supabase = await createAuthClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${SITE_URL}/auth/confirm` },
    });
    if (error) console.error("signInWithOtp failed", error.message);
  }

  return { step: "code", email };
}

export async function verifyCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("code") ?? "").replace(/\s/g, "");

  if (!/^\d{6,10}$/.test(token)) {
    return { step: "code", email, error: "Enter the code from the email." };
  }
  if (!isAdminEmail(email)) {
    return { step: "code", email, error: "That code is invalid or has expired." };
  }

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) {
    return { step: "code", email, error: "That code is invalid or has expired." };
  }

  redirect("/admin/guests");
}

export async function signOut() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
