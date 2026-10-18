@AGENTS.md

# Wedding invitation: project rules

## Who this is for

This site will be handed over to someone who **does not code**. After hand-off, every change to the
website's content must be possible in the browser, without touching code, git, or a terminal.

- **Content** (text, dates, places, images, links, link previews) is edited in **Payload CMS** at `/cms`.
- **Guests and RSVPs** are managed in the guest admin at `/admin/guests` (Supabase). Guest records are
  not CMS content; don't move them into Payload.

## The rule: every detail is editable in the CMS

Anything a visitor can see or read must come from Payload. Never hard-code it in a component.

This includes:
- headings, section titles, paragraphs, greetings ("Dear …"), and the "&" between the names
- button labels, form labels, placeholders, and help text on the RSVP form
- messages guests see: thank-you, already-replied, RSVPs-closed, errors, the invalid-link page, the home page
- dates and times, venues, addresses, map links, schedule, dress code, hashtag
- images (photos, the link-preview banner) and their alt text
- the browser tab title, meta description, and link-preview (Open Graph / Twitter) title, description and image
- countdown labels ("Days", "Hours", …)

Not covered by the rule: the guest admin's own interface (`/admin`), developer-only log messages, and
the layout and code structure. Colours and fonts are optional, but if you add them, put them in the CMS
as a "Theme" global rather than in CSS constants.

### When you add or change anything on the site

1. **Add a CMS field for every new piece of visible content** in the same change. Don't ship hard-coded
   text with a "move to CMS later" note.
2. **Put fields where an editor would look for them:**
   - `wedding` global (`src/payload/globals/Wedding.ts`): the event facts (names, dates, venues, schedule)
   - other areas get their own global, e.g. "Page text" (headings, messages, labels) and "Sharing & SEO"
     (meta and link preview). Group fields with `tabs`/`row`/`collapsible` so the form reads top to bottom
     like the page.
3. **Write fields for a non-technical editor:**
   - a plain-English `label`, and an `admin.description` saying where it appears on the page, with an example
   - `required` only when the page would break without it
   - `{name}` style placeholders only when unavoidable, and explain them in the description
     (e.g. "Use {name} for the guest's name")
4. **Keep the site working when the CMS is empty.** Every field needs a default in
   `src/lib/wedding-defaults.ts` (or a matching defaults file), used both as the field's `defaultValue`
   and as the fallback when the global has never been saved.
5. **Read content through a cached getter** like `getWedding()` in `src/lib/wedding.ts`
   (`"use cache"` + `cacheTag`), and expire the tag in the global's `afterChange` hook so saved edits
   show on the next page load.
6. **Images use a Payload `upload` field** backed by a Media collection with persistent storage
   (Vercel's filesystem is read-only, so use a storage adapter such as S3/Supabase Storage). Always
   include an alt-text field.
7. **Schema changes go through migrations** (`push: false`): run `npm run payload migrate:create`, commit
   the file in `src/migrations/`, then `npm run generate:types`.
8. **Verify the edit path:** change the value in `/cms`, save, and confirm the live page updates without a
   redeploy. A change isn't done until this works.
9. **Update the editor's guide** in the README ("Editing the website" section): which global/field
   controls what, in plain language.
10. **Migrations deploy themselves:** `prodMigrations` applies pending migrations when the deployed app
    starts, so never ask the owner to run database commands.

### Where content lives now

- `wedding` global: event facts (names, dates, venues, schedule, dress code, hashtag)
- `pageText` global (`src/payload/globals/PageText.ts`): all other visible wording, defaults in
  `src/lib/site-content-defaults.ts`, read with `getPageText()`; placeholders filled with `fill()`
- `seo` global (`src/payload/globals/Seo.ts`): tab title, description, link-preview title/text/image,
  read with `getSeo()`; empty fields fall back to automatic wording; bundled fallback image is
  `public/og-default.jpg`
- `media` collection: uploads in Vercel Blob (unique filenames, direct public URLs)

There are no known hard-coded gaps. Keep it that way: new visible text gets a field in the same change.

## Other conventions

- **The GitHub repo is public.** Never commit secrets or passwords. They live in `.env.local` (gitignored)
  and in Vercel's environment variables. That includes the Supabase keys, `DATABASE_URL`,
  `PAYLOAD_SECRET` and `ADMIN_DEFAULT_PASSWORD`.
- **Two separate logins:** `/cms` uses Payload users; `/admin` uses Supabase Auth accounts listed in
  `ADMIN_EMAILS` (`npm run admins`). Keep them separate.
- **Guest data is server-only.** The `guests` table has RLS on with no policies; access goes through the
  secret-key client after `requireAdmin()` (admin) or the invite-code lookup (guests).
- **Larger changes** follow the OpenSpec workflow (`/opsx:propose` → `/opsx:apply`).
- **Deploys:** Vercel builds `main` automatically. Work on a branch and merge through a pull request.
