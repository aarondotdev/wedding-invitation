## Why

Managing guests currently requires the command line (`npm run guests`). The couple wants a web page where they can add guests one by one, copy each guest's link or QR code, and bulk-import a guest list from Excel without touching a terminal. Because this page can read and change every guest, it must be protected by a real login.

## What Changes

- Add an admin login at `/admin/login` using Supabase Auth email one-time codes. Only emails in an `ADMIN_EMAILS` allowlist can sign in, and there are no passwords.
- Add `/auth/confirm` so the sign-in email's link also works when it's opened on the same device.
- Add a Next.js Proxy (`src/proxy.ts`) scoped to `/admin` and `/auth` that refreshes Supabase sessions and redirects signed-out visitors to the login page.
- Add `/admin/guests` with:
  - a summary of invites, seats and RSVPs
  - a table with each guest's RSVP, opened status, a copy-link button and a QR code download
  - per-guest actions: edit, reissue link, revoke/restore, delete
  - an add-guest form that shows the new link immediately
  - a links CSV export
- Add bulk import from `.xlsx` or `.csv` with a preview step that marks rows as ready, duplicate or invalid before anything is saved, plus a downloadable template.
- Every admin page, Server Action and route handler re-checks the admin session on the server. Guest data access stays server-only through the existing secret-key client.

## Capabilities

### New Capabilities
- `admin-auth`: Email one-time-code login restricted to an allowlist, session refresh, sign-out, and server-side authorization of all admin surfaces.
- `admin-guest-management`: View, add, edit, delete, revoke, restore and reissue guests; copy links, download QR codes, export a CSV.
- `admin-guest-import`: Upload an Excel or CSV guest list, preview validation results, and import valid rows.

### Modified Capabilities
<!-- None. The guest-facing invite and RSVP behaviour is unchanged. -->

## Impact

- **Dependencies:** `@supabase/ssr` (pinned), `read-excel-file`. `qrcode` moves from dev dependencies to dependencies.
- **Environment:** `SUPABASE_PUBLISHABLE_KEY` (server-side use only) and `ADMIN_EMAILS` (comma-separated).
- **Supabase dashboard (manual, one-time):** edit the Magic Link email template to include the code (`{{ .Token }}`) and the confirm link. Disabling public sign-ups is recommended.
- **Admin users:** each allowlisted email must have a Supabase Auth user (`shouldCreateUser: false`). An `npm run admins` script creates them.
- **Code:** new `src/proxy.ts`, `src/lib/auth.ts`, `src/lib/supabase-server.ts`, `src/lib/guests.ts`, `src/app/admin/**`, `src/app/auth/confirm/route.ts`, `scripts/admins.mjs`.
