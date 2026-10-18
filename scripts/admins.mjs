// Creates a Supabase Auth user for every address in ADMIN_EMAILS so they can sign in to /admin.
// Run via `npm run admins` (loads .env.local). Safe to re-run; existing users are skipped.

import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SECRET_KEY, ADMIN_EMAILS = "" } = process.env;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("Error: SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env.local");
  process.exit(1);
}

const emails = ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
if (!emails.length) {
  console.error("Error: ADMIN_EMAILS is empty. Add comma-separated emails to .env.local first.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const existing = new Set();
for (let page = 1; ; page++) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
  data.users.forEach((u) => u.email && existing.add(u.email.toLowerCase()));
  if (data.users.length < 1000) break;
}

for (const email of emails) {
  if (existing.has(email)) {
    console.log(`${email}: already exists`);
    continue;
  }
  const { error } = await supabase.auth.admin.createUser({ email, email_confirm: true });
  console.log(error ? `${email}: failed — ${error.message}` : `${email}: created`);
}
