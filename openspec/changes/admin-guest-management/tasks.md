## 1. Setup

- [x] 1.1 Install `@supabase/ssr` and `read-excel-file` (exact versions); move `qrcode` to dependencies
- [x] 1.2 Add `SUPABASE_PUBLISHABLE_KEY` and `ADMIN_EMAILS` to `.env.local` and `.env.example`
- [x] 1.3 Add `scripts/admins.mjs` + `npm run admins` to create Supabase Auth users for every `ADMIN_EMAILS` address with `ADMIN_DEFAULT_PASSWORD`, plus `set-password <email>`; run it

## 2. Auth

- [x] 2.1 `src/lib/supabase-server.ts`: cookie-based `createServerClient` (publishable key, server-only)
- [x] 2.2 `src/proxy.ts`: session refresh via `getClaims()` for `/admin/:path*`; redirect signed-out users to `/admin/login`
- [x] 2.3 `src/lib/auth.ts`: `isAdminEmail()`, `requireAdmin()` (verifies claims + allowlist, signs out and redirects otherwise)
- [x] 2.4 `/admin/login` page with email + password form and `signIn` Server Action; same error for wrong password and non-allowlisted email
- [x] 2.5 Remove the email-code flow (`/auth/confirm`, OTP actions) after switching to passwords
- [x] 2.6 Admin layout with noindex metadata, header showing signed-in email and sign-out action; `/admin` redirects to `/admin/guests`

## 3. Guest management

- [x] 3.1 `src/lib/guests.ts`: list query, stats, `validateGuestRow`, invite URL and CSV helpers
- [x] 3.2 `/admin/guests` page: summary cards and guest table (RSVP, opened, revoked)
- [x] 3.3 Add-guest form + action; show the new link with copy button
- [x] 3.4 Row actions: copy link, QR download, edit (inline form), revoke/restore, reissue (confirm), delete (confirm)
- [x] 3.5 `/admin/guests/[id]/qr` PNG route and `/admin/guests/export` CSV route, both admin-guarded and `no-store`

## 4. Import

- [x] 4.1 `previewImport` action: file type/size checks, `.xlsx` via `read-excel-file/node`, `.csv` via `csv-parse`, header aliases, per-row status
- [x] 4.2 Import UI: upload, preview table with counts, confirm button
- [x] 4.3 `commitImport` action: re-validate, re-check duplicates, insert, refresh, report
- [x] 4.4 `/admin/guests/template` CSV route

## 5. Verification

- [x] 5.1 `npm run lint` and `npm run build` pass
- [x] 5.2 Signed-out requests: `/admin/guests` redirects to login; export/QR routes and actions reject
- [x] 5.3 Sign in end-to-end with password; wrong password and non-allowlisted email get the same message
- [x] 5.4 Exercise add/edit/revoke/restore/reissue/delete, QR, export, and an `.xlsx` import with ready/duplicate/invalid rows
- [x] 5.5 No Supabase keys or client code in `.next/static`
- [x] 5.6 README: admin setup (env, `npm run admins`, `set-password`) and usage
