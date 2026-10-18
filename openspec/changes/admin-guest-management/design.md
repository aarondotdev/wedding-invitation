## Context

Guest data lives in `public.guests`, which has RLS on with no policies and no `anon`/`authenticated` grants. Only the server touches it, through `supabaseAdmin()` (secret key) in `src/lib/supabase.ts`. The app runs Next.js 16 with Cache Components; there's no `proxy.ts` yet. Admins are the couple (two or three people) and use phones and laptops interchangeably.

## Goals / Non-Goals

**Goals:**
- Passwordless login for a small fixed set of emails. It must work when the email is opened on a different device from the browser.
- Authorization enforced server-side on every admin surface, not only in Proxy.
- Guest CRUD and bulk import without the CLI.

**Non-Goals:**
- Roles or permissions beyond "is an admin".
- Giving the `authenticated` role database access. Admin data access keeps using the secret key after the server verifies the admin.
- Sending invitations from the app.
- A zip download of all QR codes. The CLI export already does this; individual QR downloads are in scope.

## Decisions

### 1. Email and password, managed from the CLI
`signInWithPassword({ email, password })` runs in a Server Action. Admin accounts are created by `npm run admins` with `ADMIN_DEFAULT_PASSWORD` (kept only in `.env.local`, because the repo is public) and changed with `npm run admins -- set-password <email>`. Passwords must be at least 12 characters.
- *Why:* it needs no email template, no Site URL setup and no email delivery, so it works right after deploy. The admins are two people who can run a terminal command to reset a password.
- *Superseded:* email one-time codes plus a `/auth/confirm` link. They needed a custom Magic Link template and depended on Supabase's rate-limited default email sender.
- *Trade-off:* a shared default password is guessable, so admins should change it after the first sign-in. Supabase rate-limits sign-in attempts.

### 2. Allowlist in env, checked on the verified email
`ADMIN_EMAILS` is a comma-separated, case-insensitive list. Authorization reads `email` from `getClaims()`, which validates the JWT signature. It never uses `user_metadata`.
- Sign-in returns the same "Incorrect email or password." for a wrong password and for a non-allowlisted email, and skips the Supabase call for non-allowlisted emails, so the form can't be used to discover admins.
- *Alternative:* `app_metadata.role = 'admin'`. This is more flexible, but an env list is simpler for two people and needs no claim-freshness handling.

### 3. All Supabase calls stay server-side, with no browser client
The auth client (`createServerClient` from `@supabase/ssr`) uses `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY` with **no** `NEXT_PUBLIC_` prefix, because login runs entirely in Server Actions. Nothing Supabase-related ships to the browser.

### 4. Proxy for session refresh and optimistic redirect; DAL for authorization
`src/proxy.ts` matches only `/admin/:path*`. Guest pages don't pay the cost. It follows the official `updateSession` pattern: `getClaims()` refreshes tokens and copies the cookies and cache headers onto the response. It redirects to `/admin/login` when there are no claims.
`requireAdmin()` in `src/lib/auth.ts` re-checks claims and the allowlist. It's called at the top of every admin page, Server Action and route handler, because Proxy is not an authorization boundary (Next and Supabase docs).
- An authenticated user who isn't on the allowlist (for example, someone removed from it) is signed out and sent to the login page with an error.

### 5. Rendering with Cache Components
Admin pages read cookies and must never be cached. Each admin page sets `export const instant = false` and awaits `requireAdmin()` and its data at the top. This is the documented opt-out for session-reading routes; a loading skeleton adds nothing for a two-person tool. Mutations call `refresh()` from `next/cache` to re-render with fresh data.

### 6. Shared guest logic in `src/lib/guests.ts`
This module (server-only) holds the guest list query, stats, row validation (`validateGuestRow`), CSV building and invite URL helpers. Admin actions and route handlers use it. The `.mjs` CLI keeps its own copy for now; it can't import TypeScript without a build step.

### 7. Import flow: parse, then preview, then commit
- `previewImport(formData)` is a Server Action. It reads the uploaded file (≤ 2 MB). `.xlsx` is parsed with `read-excel-file/node`, `.csv` with `csv-parse`. Headers are case-insensitive, and aliases (`guest`, `seats`, `party size`) are accepted. Each row comes back as `ready`, `duplicate` or `invalid`, with a reason.
- `commitImport(rows)` re-validates the rows sent back by the client, re-checks for duplicates against the database, then inserts.
- *Why not insert straight away:* the preview catches column mistakes before 150 bad rows land in the table.
- *Why `read-excel-file`:* it's small and maintained, and parses on the server. The `xlsx` (SheetJS) npm release is outdated and has known advisories.
- Template: `/admin/guests/template` serves a CSV with the expected headers, which opens in Excel. The page explains that `.xlsx` files with the same headers work.

### 8. QR codes and export via route handlers
- `/admin/guests/[id]/qr` returns a PNG made with `qrcode`.
- `/admin/guests/export` returns `links.csv`.
- Both call `requireAdmin()`, send `Cache-Control: no-store`, and use `NEXT_PUBLIC_SITE_URL` for links.

### 9. Destructive actions
Delete and reissue ask for confirmation in the browser (`confirm()`) before submitting. Delete is permanent, because there's no soft-delete column. Revoke is the reversible option, and the UI says so.

## Risks / Trade-offs

- [The default password is guessable] → It's kept out of the repo, the minimum length is 12 characters, and the README says to change it after the first sign-in.
- [An admin removed from `ADMIN_EMAILS` still has a session] → `requireAdmin()` rejects them on the next request, because the allowlist is checked every time.
- [Public sign-ups stay enabled in Supabase] → Accounts created outside the app gain nothing: no grants and not on the allowlist. Turning off sign-ups is still recommended.
- [A large Excel file] → 2 MB / 1000-row limits, enforced server-side.

## Migration Plan

1. Install the dependencies and add the env vars: `SUPABASE_PUBLISHABLE_KEY`, `ADMIN_EMAILS`, `ADMIN_DEFAULT_PASSWORD`.
2. Run `npm run admins` to create the auth users with the default password.
3. Deploy. Rollback: remove `/admin` and `proxy.ts`. Guest-facing pages are unaffected.

## Open Questions

- None blocking.
