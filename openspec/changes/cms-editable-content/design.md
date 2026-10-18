## Context

Payload 3.91 runs inside the Next.js 16 app at `/cms`, backed by Supabase Postgres (`payload` schema, `push: false`, migrations in `src/migrations`). One global (`wedding`) feeds the site through `getWedding()`, which is cached with `"use cache"` + `cacheTag("wedding")` and expired by the global's `afterChange` hook. The editor will be a non-technical person.

## Goals / Non-Goals

**Goals:** every visitor-visible string and the share image are editable; the form reads like the page; the site renders correctly with an empty CMS; saved edits appear without a redeploy.

**Non-Goals:** editing the guest admin UI (`/admin`); colours and fonts (optional per `CLAUDE.md`; not requested); multiple languages.

## Decisions

1. **Two new globals, split by what the editor is thinking about.**
   - "Page text" (`pageText`) uses tabs that mirror the page from top to bottom.
   - "Sharing & SEO" (`seo`) holds everything that shows up in browser tabs and chat previews.
   - *Alternative:* add everything to the `wedding` global. Rejected: one very long form mixes facts and wording.
2. **Placeholders over string concatenation.** Messages are stored whole, e.g. `Thank you, {name}! …`, and filled by a small `fill(template, vars)` helper. Each field's description lists the placeholders it accepts. Unknown placeholders are left as typed, so a typo is visible instead of breaking the page.
3. **Defaults in one place.** `src/lib/site-content-defaults.ts` holds every default. It supplies field `defaultValue`s and is the fallback when a global has never been saved or a field is empty, the same pattern as `wedding-defaults.ts`.
4. **SEO text falls back to automatic wording.** Empty title or description fields produce the current generated text from the names and date. The editor only overrides what they want to change, and the preview stays correct when the date changes.
5. **One cache tag per global** (`page-text`, `seo`), each expired by its own `afterChange` hook. Getters are `"use cache"` + `cacheLife("max")`.
6. **Media in Vercel Blob.** The `media` collection is an upload collection with a required `alt` field and images only, using `@payloadcms/storage-vercel-blob`.
   - The plugin is enabled only when `BLOB_READ_WRITE_TOKEN` is set, so local dev without a token stores files on disk.
   - The share image comes from the media URL (Blob URLs are absolute). The bundled crop moves to `public/og-default.jpg` as the fallback, replacing the `opengraph-image.jpg` file convention, which can't be overridden at runtime.
7. **Client components receive text as props.** `RsvpForm` and `Countdown` are client components, so the server page passes the strings they need. Server Actions (`submitRsvp`) read `getPageText()` directly for error messages.
8. **`prodMigrations`.** The postgres adapter runs pending migrations when the app starts in production, so the owner never has to run a migration command after a code change is deployed.

## Risks / Trade-offs

- [The editor deletes a placeholder such as `{name}`] → The message still renders, just without the name. Descriptions explain the placeholders.
- [The Blob token is missing in production] → Uploads would fail to persist. Mitigation: create the store and connect it to the project as part of this change, and verify an upload end to end.
- [Migration on cold start adds latency once] → It's a one-time run per new migration.

## Migration Plan

1. Install the storage adapter, add the collection and globals, and generate the migration and types.
2. Run the migration locally against the shared database (it only adds tables).
3. Create the Vercel Blob store and connect it to the project.
4. Deploy. Rollback: revert the commit. The extra tables are harmless.
