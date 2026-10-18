import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cookie-based client for Supabase Auth (admin sign-in). Guest data still goes through
// supabaseAdmin() in ./supabase.ts after requireAdmin() has verified the session.
export async function createAuthClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, which can't set cookies; the proxy refreshes sessions.
        }
      },
    },
  });
}
