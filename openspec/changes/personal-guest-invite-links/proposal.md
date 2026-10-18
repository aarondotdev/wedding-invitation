## Why

The invitation is currently a single public page: anyone with the URL can see the venue, schedule and RSVP form, and RSVPs go nowhere (`RsvpForm` has a TODO). We want only invited guests to open the invitation, know exactly who is coming, and stop RSVPs from exceeding the seats we offered.

## What Changes

- Add a Supabase `guests` table holding one row per invited guest/household with a random, unguessable invite code, display name, allowed party size, and RSVP fields.
- Add a personal invitation route `/i/[code]` that looks up the code server-side and renders the invitation personalized with the guest's name; unknown or revoked codes show a polite "invalid link" page.
- **BREAKING**: The root route `/` no longer renders the invitation. It shows a short "please use your personal invitation link" message instead.
- Wire `RsvpForm` to a Server Action that saves the RSVP to the guest's row, keyed by invite code, with the guest count capped at that guest's party size. Guests can update their RSVP until the RSVP deadline.
- Record when a guest first opens their link (`opened_at`) so the couple can see who has viewed the invitation.
- Add a local script that imports a guest list CSV into Supabase and exports a CSV of personal links plus QR code PNGs for distribution (WhatsApp/SMS/email/printed cards).
- Support revoking a code (e.g. a leaked link) and issuing a new one.

## Capabilities

### New Capabilities
- `guest-invite-access`: Access control for the invitation — personal code links, invalid/revoked handling, root page lockout, open tracking.
- `guest-rsvp`: Persisted RSVP per guest with party-size cap, deadline, and update support.
- `invite-link-distribution`: Tooling to import guests, generate codes, revoke/reissue codes, and export links and QR codes.

### Modified Capabilities
<!-- None: no existing specs in openspec/specs/. -->

## Impact

- **New dependency**: `@supabase/supabase-js` (server-only usage), plus `qrcode` and a CSV parser as dev dependencies for the script.
- **Supabase project** `ajbjgkvenmsnxirpodfg`: new `guests` table with RLS enabled and no anon/authenticated access; migration applied via MCP.
- **Environment**: `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (server-only, in `.env.local` and the hosting provider), `NEXT_PUBLIC_SITE_URL` for link generation.
- **Code**: `src/app/page.tsx` (replaced), new `src/app/i/[code]/page.tsx`, invitation markup moved into a reusable component, `src/components/RsvpForm.tsx` (Server Action + prefill), new `src/lib/supabase.ts` and `src/app/i/[code]/actions.ts`, new `scripts/` folder.
