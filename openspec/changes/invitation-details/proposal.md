## Why

The couple's reference invitation (a Wix "details" page) covers more than ours: parents and principal sponsors, the full entourage, a dress code with a colour palette, FAQs and a photo gallery. They also supplied 93 prenup photos and want them placed the way the Bricksfly "Dance" demo places images.

## What Changes

- **Family & entourage** section, editable in a new "Family & entourage" CMS global:
  - parents (groups)
  - principal sponsors (shown in two columns)
  - entourage groups: best man, maid of honour, groomsmen, bridesmaids, veil/cord/candle sponsors, bearers and flower girls
  - all names are placeholders
- **Dress code** section with a description and colour swatches, plus an optional attire photo.
- **FAQ** accordion.
- **Gallery** that scrolls sideways on desktop, with photos turning from black and white to colour. These three live in a new "Guest details" CMS global.
- **Story chapters:** numbered rows with alternating large portrait photos, mirroring the demo's class list.
- **Statement photos:** a full-width photo band before the statement, plus a large landscape photo below it, as in the demo.
- **Menu labels** for the new sections.
- **26 selected prenup photos** resized and uploaded to the CMS image library (Vercel Blob), with descriptions, and assigned to the chapters, events, band, statement and gallery. They are not committed to the public repository.
- **Fix:** CMS hooks no longer crash when Payload runs outside Next.js (`payload run` scripts).
- The "Wall of love" guestbook from the reference is out of scope; it needs moderation and spam protection.

## Capabilities

### New Capabilities
- `invitation-details`: Entourage, dress code, FAQ, gallery and story chapters, all CMS-editable, with image placements following the reference design.

### Modified Capabilities
<!-- invitation-design gains sections; behaviour of existing sections is unchanged. -->

## Impact

- **Database:** migration `invitation_details` adds 11 tables and 6 columns in the `payload` schema.
- **Code:** `Entourage`/`Details` globals, `details-defaults.ts`, getters in `site-content.ts`, `Invitation.tsx`, horizontal gallery and colorize in `InvitationMotion`, `src/lib/revalidate.ts`.
- **Content:** 26 images in Vercel Blob, referenced by the `pageText`, `wedding` and `details` globals.
