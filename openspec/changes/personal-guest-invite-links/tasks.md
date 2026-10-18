## 1. Database

- [x] 1.1 Apply Supabase migration `create_guests`: `pgcrypto`-backed `generate_invite_code()` function, `guests` table per design data model, checks (party_size 1–20, guest_count ≤ party_size), unique code index
- [x] 1.2 Enable RLS on `guests` with no policies; revoke all privileges on `guests` and `generate_invite_code` from `anon` and `authenticated`
- [x] 1.3 Run Supabase security advisors and fix any findings for the new objects
- [x] 1.4 Insert one test guest via SQL and confirm a 12-char URL-safe code is generated; confirm the anon key cannot read it

## 2. Setup & config

- [x] 2.1 Install `@supabase/supabase-js` and `server-only`; install `csv-parse` and `qrcode` as dev dependencies
- [x] 2.2 Create `.env.local` with `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (placeholder for the user to fill), `NEXT_PUBLIC_SITE_URL`; add `.env.example` documenting them
- [x] 2.3 Add `src/lib/supabase.ts` (`import "server-only"`, secret-key client, `Guest` type, `getGuestByCode(code)` returning null for unknown/revoked/malformed codes)
- [x] 2.4 Add `rsvpDeadline` ISO field to `src/lib/wedding.ts`
- [x] 2.5 Add `Referrer-Policy: no-referrer` header for `/i/:path*` in `next.config.ts`; add `invites/` to `.gitignore`

## 3. Invitation pages

- [x] 3.1 Extract current invitation markup from `src/app/page.tsx` into `src/components/Invitation.tsx` taking a `guest` prop (personalized greeting, passes guest to RSVP)
- [x] 3.2 Replace `src/app/page.tsx` with a minimal page: couple names + "please use your personal invitation link", no venue/schedule/RSVP
- [x] 3.3 Create `src/app/i/[code]/page.tsx`: static shell + `<Suspense>` around guest lookup; call `notFound()` for invalid codes; `robots: noindex, nofollow` metadata
- [x] 3.4 Create `src/app/i/[code]/not-found.tsx` with the polite invalid-link message
- [x] 3.5 Record `opened_at` on first successful open using `after()`

## 4. RSVP

- [x] 4.1 Create `src/app/i/[code]/actions.ts` with `submitRsvp(code, prevState, formData)`: re-fetch guest, check deadline, validate attending and 1 ≤ guest_count ≤ party_size (0 when declining), update row, return success/error state
- [x] 4.2 Rework `src/components/RsvpForm.tsx`: remove name/email fields, bind code to action via `useActionState`, guest-count options 1..party_size (hidden when party size is 1), prefill previous response, pending/error/success states
- [x] 4.3 After the deadline, render the recorded response and a "contact the couple" note instead of the form

## 5. Distribution script

- [x] 5.1 Create `scripts/guests.mjs` with shared Supabase client from env and `import <csv>` (validates rows, skips existing names, reports counts)
- [x] 5.2 Add `export [outDir]` writing `links.csv` and one QR PNG per non-revoked guest (default `invites/`)
- [x] 5.3 Add `revoke <code>`, `restore <code>`, `reissue <code>` subcommands
- [x] 5.4 Add `guests` npm script (`node --env-file=.env.local scripts/guests.mjs`) and a sample `scripts/guests.example.csv`

## 6. Verification

- [x] 6.1 `npm run lint` and `npm run build` pass with Cache Components enabled
- [x] 6.2 Manually verify with the test guest: valid link renders personalized page, unknown/revoked code shows invalid page (noindex), `/` shows no details, RSVP saves and caps guest count, `opened_at` set once
- [x] 6.3 Confirm the secret key does not appear in `.next/static` output
- [x] 6.4 Document the guest workflow (import → export → send → revoke/reissue) in README
