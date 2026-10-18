## Why

The site will be handed to a non-technical owner, and `CLAUDE.md` requires every piece of visible content to be editable in Payload CMS. Today only the event facts (names, dates, venues, schedule) are in the CMS. Headings, RSVP form wording, guest messages, the home and invalid-link pages, the countdown labels, and the link preview (text and banner image) are hard-coded.

## What Changes

- New **"Page text"** global. Each page area gets a tab: top of the invitation, section headings, RSVP form, RSVP messages, home and invalid-link pages, countdown. Messages that include the guest's name or a number use simple `{name}`/`{count}`-style placeholders, explained next to each field.
- New **"Sharing & SEO"** global: browser title, description, link-preview title, description and image, plus image alt text. Leaving a text field empty keeps the automatic wording built from the names and date.
- New **Media** collection for uploaded images, stored in Vercel Blob (Vercel's filesystem is read-only). Locally it falls back to disk when no Blob token is set.
- Components read this content through cached getters that expire when the CMS is saved, as `getWedding()` does today.
- Migrations run automatically on production start (`prodMigrations`), so schema changes deploy without manual database steps.
- README gains an **"Editing the website"** guide for the owner. `CLAUDE.md`'s gap list is cleared.

## Capabilities

### New Capabilities
- `cms-content`: All visible site text, link-preview metadata and the share image are editable in Payload, with defaults and immediate refresh on save.

### Modified Capabilities
<!-- None at the spec level: guest-facing behaviour is unchanged; only the source of the wording changes. -->

## Impact

- **Dependencies:** `@payloadcms/storage-vercel-blob` (3.91.0, matching Payload).
- **Infrastructure:** a Vercel Blob store connected to the project (`BLOB_READ_WRITE_TOKEN`).
- **Database:** one migration adding the new global and media tables in the `payload` schema.
- **Code:** `src/payload/globals/{PageText,Seo}.ts`, `src/payload/collections/Media.ts`, `src/lib/site-content*.ts`, and the site components and pages that render text.
