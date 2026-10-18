## Why

Managing guests currently requires the command line (`npm run guests`). The couple wants a web page where they can add guests one by one, copy each guest's link or QR code, and bulk-import a guest list from Excel without touching a terminal. Because this page can read and change every guest, it must be protected by a real login.

## What Changes

- Add an admin login at `/admin/login` using Supabase Auth email and password. Only emails in an `ADMIN_EMAILS` allowlist can sign in. Passwords are set from the command line, with a default kept in `.env.local`. (This originally used emailed one-time codes; it was switched to passwords so no email template or email delivery is needed.)
- Add a Next.js Proxy (`src/proxy.ts`) scoped to `/admin` that refreshes Supabase sessions and redirects signed-out visitors to the login page.
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
- `admin-auth`: Email and password login restricted to an allowlist, CLI password management, session refresh, sign-out, and server-side authorization of all admin surfaces.
- `admin-guest-management`: View, add, edit, delete, revoke, restore and reissue guests; copy links, download QR codes, export a CSV.
- `admin-guest-import`: Upload an Excel or CSV guest list, preview validation results, and import valid rows.

### Modified Capabilities
<!-- None. The guest-facing invite and RSVP behaviour is unchanged. -->

## Impact

- **Dependencies:** `@supabase/ssr` (pinned), `read-excel-file`. `qrcode` moves from dev dependencies to dependencies.
- **Environment:** `SUPABASE_PUBLISHABLE_KEY` (server-side use only), `ADMIN_EMAILS` (comma-separated), and `ADMIN_DEFAULT_PASSWORD` (local only, used by `npm run admins`).
- **Supabase dashboard:** nothing required. Disabling public sign-ups is recommended.
- **Admin users:** `npm run admins` creates a Supabase Auth user with the default password for each allowlisted email; `npm run admins -- set-password <email>` changes it.
- **Code:** new `src/proxy.ts`, `src/lib/auth.ts`, `src/lib/supabase-server.ts`, `src/lib/guests.ts`, `src/app/admin/**`, `scripts/admins.mjs`.
