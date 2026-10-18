// Admin accounts for /admin. Run via `npm run admins -- <command>` (loads .env.local).
//
//   (no command)           Create a Supabase Auth user for every address in ADMIN_EMAILS,
//                          with ADMIN_DEFAULT_PASSWORD as the starting password
//   set-password <email>   Set or reset an admin's password (prompts; input is hidden;
//                          leave it empty to reset to ADMIN_DEFAULT_PASSWORD)

import { createInterface } from "node:readline";
import { createClient } from "@supabase/supabase-js";

// The default password lives only in .env.local (gitignored); never commit it.
const { SUPABASE_URL, SUPABASE_SECRET_KEY, ADMIN_EMAILS = "", ADMIN_DEFAULT_PASSWORD = "" } = process.env;
const MIN_PASSWORD_LENGTH = 12;

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  fail("SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env.local");
}

const adminEmails = ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function listUsersByEmail() {
  const users = new Map();
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) fail(error.message);
    data.users.forEach((u) => u.email && users.set(u.email.toLowerCase(), u));
    if (data.users.length < 1000) return users;
  }
}

async function syncAdmins() {
  if (!adminEmails.length) fail("ADMIN_EMAILS is empty. Add comma-separated emails to .env.local first.");
  if (!ADMIN_DEFAULT_PASSWORD) fail("ADMIN_DEFAULT_PASSWORD is empty. Set it in .env.local first.");
  const existing = await listUsersByEmail();
  for (const email of adminEmails) {
    if (existing.has(email)) {
      console.log(`${email}: already exists`);
      continue;
    }
    const { error } = await supabase.auth.admin.createUser({
      email,
      password: ADMIN_DEFAULT_PASSWORD,
      email_confirm: true,
    });
    console.log(error ? `${email}: failed — ${error.message}` : `${email}: created with the default password`);
  }
  console.log(`\nChange a password with: npm run admins -- set-password <email>`);
}

// Reads one line without echoing it. When stdin isn't a terminal (piped), reads it as-is.
function askHidden(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
  if (process.stdin.isTTY) {
    rl._writeToOutput = (s) => {
      if (s.includes(question)) process.stdout.write(s);
    };
  }
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      if (process.stdin.isTTY) process.stdout.write("\n");
      resolve(answer);
    }),
  );
}

async function setPassword(rawEmail) {
  const email = (rawEmail ?? "").trim().toLowerCase();
  if (!email) fail("usage: npm run admins -- set-password <email>");
  if (!adminEmails.includes(email)) fail(`${email} is not in ADMIN_EMAILS, so it couldn't sign in anyway.`);

  const typed = await askHidden("New password (leave empty for the default): ");
  const password = typed || ADMIN_DEFAULT_PASSWORD;
  if (!password) fail("No password entered and ADMIN_DEFAULT_PASSWORD is not set.");
  if (password.length < MIN_PASSWORD_LENGTH) fail(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
  if (process.stdin.isTTY && typed && (await askHidden("Repeat password: ")) !== password) {
    fail("Passwords don't match.");
  }

  const user = (await listUsersByEmail()).get(email);
  const { error } = user
    ? await supabase.auth.admin.updateUserById(user.id, { password })
    : await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) fail(error.message);
  console.log(`Password ${user ? "updated" : "set"} for ${email}. Sign in at /admin.`);
}

const [command, arg] = process.argv.slice(2);
if (!command) await syncAdmins();
else if (command === "set-password") await setPassword(arg);
else fail(`unknown command "${command}". Use: (no command) or set-password <email>`);
