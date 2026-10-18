"use server";

import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/auth";
import { createAuthClient } from "@/lib/supabase-server";

export type LoginState = { error?: string; email?: string };

// Same message for every failure, so the form doesn't reveal which emails are admins.
const FAILED = "Incorrect email or password.";

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password.", email };
  if (!isAdminEmail(email)) return { error: FAILED, email };

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.status === 429) {
      return { error: "Too many attempts. Please wait a few minutes and try again.", email };
    }
    return { error: FAILED, email };
  }

  redirect("/admin/guests");
}

export async function signOut() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
