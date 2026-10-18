## 1. Setup

- [x] 1.1 Install `@payloadcms/storage-vercel-blob@3.91.0`
- [x] 1.2 Add `prodMigrations` to the postgres adapter

## 2. Content model

- [x] 2.1 `src/lib/site-content-defaults.ts`: defaults for page text and SEO, `fill()` helper, cache tags
- [x] 2.2 `Media` collection (images, required alt) + Vercel Blob plugin (enabled when token is set)
- [x] 2.3 `PageText` global with tabs mirroring the page, placeholder descriptions, revalidate hook
- [x] 2.4 `Seo` global (title, description, share title/description, share image, alt), revalidate hook
- [x] 2.5 Generate migration + types; run migration

## 3. Wire up the site

- [x] 3.1 `src/lib/site-content.ts`: cached `getPageText()` and `getSeo()` with fallbacks
- [x] 3.2 Invitation hero, section headings, map/dress code/respond-by text from CMS
- [x] 3.3 RSVP form labels, buttons, messages via props; server action errors from CMS
- [x] 3.4 Countdown labels via props
- [x] 3.5 Home page and invalid-link page from CMS
- [x] 3.6 `generateMetadata` from SEO global; move bundled banner to `public/og-default.jpg`

## 4. Storage & deploy

- [x] 4.1 Create Vercel Blob store and connect it to the project (production `BLOB_READ_WRITE_TOKEN`)

## 5. Verification & docs

- [x] 5.1 Lint and build pass
- [x] 5.2 Edit text in `/cms` → page updates without redeploy; empty CMS renders defaults
- [x] 5.3 Upload a share image → `og:image` uses it
- [x] 5.4 README "Editing the website" guide; clear `CLAUDE.md` gap list
