# Wedding Invitation

A Next.js wedding invitation where every guest gets a personal link (`/i/<code>`). Only people with a valid link can see the invitation and RSVP. Guests and RSVPs are stored in Supabase. All the wording, dates, places and the link-preview image are edited in the browser at `/cms`; no code changes are needed.

## Setup

1. Copy `.env.example` to `.env.local` and fill in:
   - `SUPABASE_URL`: your project URL
   - `SUPABASE_SECRET_KEY`: Supabase dashboard → Project Settings → API Keys → **Secret keys** (`sb_secret_...`). Server-only; never commit it or prefix it with `NEXT_PUBLIC_`.
   - `NEXT_PUBLIC_SITE_URL`: the address guests will open, e.g. `https://ourwedding.com`
   - `DATABASE_URL`, `PAYLOAD_SECRET`: for the content editor at `/cms` (see `.env.example`)
   - `BLOB_READ_WRITE_TOKEN`: image storage for uploads (`vercel env pull` fetches it)
2. `npm install`
3. `npm run dev`, then open a guest link such as `http://localhost:3000/i/<code>`

**Theme switcher** (local development only): a **Theme** button in the bottom-right corner opens a panel that previews other looks on the real page: **theme** (colour palette), **fonts**, **header** style and **hero layout**. Your choice is saved in your browser only (the button shows "• preview"); **Reset** returns to the defaults. Guests always see the defaults, and the panel never appears on the live site.

All presets live in `src/theme/config.ts`:
- **Change the live look:** edit `defaults` and deploy.
- **Add a colour theme:** add an entry to `themes` (text colours should keep WCAG AA contrast on the background).
- **Add a font pairing:** put the `.woff2` file in `src/theme/fonts/` (fonts are self-hosted), declare it in `src/theme/fonts.ts`, then add an entry to `fonts`.
- **Headers and layouts** are built-in variants (CSS in `src/app/(site)/globals.css`); a new one needs its CSS as well as a config entry.

**React Grab** (local development only): hover any element on the site and press **Ctrl+C** (⌘+C on Mac) to copy its React component, file and HTML, ready to paste into a coding agent. It's a pinned dev dependency; `npm run dev` copies it to `public/react-grab.js` (gitignored), and it never loads in production.

## Editing the website (`/cms`)

Everything visitors read or see is changed here. You don't need to touch any code.

1. Go to **`/cms`** on the website (e.g. `https://wedding-invitation-rust-alpha.vercel.app/cms`) and sign in.
2. Open one of the sections on the left, change the text, and click **Save**.
3. Refresh the website. Your change is already live; there's nothing to publish or deploy.

| Section | What it controls |
| --- | --- |
| **Wedding details** | The couple's names, wedding date and time (drives the countdown), how the date is written, the RSVP deadline, hashtag, dress code, the ceremony and reception (time, venue, address, map link, optional photo), and the order of the day |
| **Page text** | All other wording and the main photos, in tabs that follow the page from top to bottom: **Top of the invitation** (greeting, lines around the names, an optional large photo behind the names), **Menu** (the links at the top, which also label each section), **Our story** (heading, text, and numbered **chapters** with a photo each that alternate left and right), **Big statement** (the large sentence that lights up as guests scroll, a short note, a full-width photo above it, a small photo beside it and a large photo below), section headings, countdown labels, the reply form, reply messages, the home page and the "invalid link" page |
| **Family & entourage** | Parents, principal sponsors and the entourage (best man, maid of honour, groomsmen, bridesmaids, veil/cord/candle sponsors, bearers, flower girls). Each is a group with a heading and a list of names; add, remove or drag to reorder. |
| **Guest details** | **Dress code** (what to wear, colour swatches with name and hex code like `#A3B18A`, optional attire photo), **Questions & answers**, and the **Gallery** (photos shown in order; on computers they scroll sideways and turn from black-and-white to colour) |
| **Sharing & SEO** | The browser-tab title and the preview shown when a link is pasted into WhatsApp, Messenger, Viber or iMessage: title, text and image |
| **Images** | Photos you've uploaded. Each needs a short description. |

**Photos** appear in black and white on the invitation (gallery photos turn to colour as guests scroll); the originals you upload stay in colour. Tall (portrait) photos work best for chapters and venues, wide ones for the full-width photo and the gallery. Any photo can be left empty, and that part of the page simply shows text (with no photo behind the names, the top of the invitation shows just the names). **Emptying a list** (e.g. all questions, or all gallery photos) hides that section.

**Keeping faces in view:** photos are cropped to fit their spot, which differs between phones and computers. To choose what stays in view, open the photo in *Images* and click the spot to keep (for example, between the couple's faces) on the preview. This is Payload's focal point. It defaults to the centre.

**Words in `{curly brackets}`** are filled in automatically, e.g. `{name}` becomes the guest's name. Keep them exactly as they are; the hint under each field says which ones it uses.

**Empty fields** go back to the original wording. In *Sharing & SEO*, an empty title or description uses automatic text built from the names and date, so it stays correct if the date changes.

**Changing the link-preview photo:** in *Sharing & SEO*, click **Preview image**, upload a photo and give it a description. A wide photo works best (1200 × 630 pixels, faces near the middle). Chat apps keep old previews for links shared before, so new links show the new photo right away and older ones may take a while.

**Adding someone who can edit:** in `/cms`, open **Users** and click **Create New**. This is separate from the guest admin login.

## Guest admin page (`/admin/guests`)

Add guests, copy their links, download QR codes, import a list from Excel, and track RSVPs in the browser.

### One-time setup

1. In `.env.local`, set:
   - `SUPABASE_PUBLISHABLE_KEY`: Project Settings → API Keys → Publishable key
   - `ADMIN_EMAILS`: the comma-separated emails allowed to sign in
   - `ADMIN_DEFAULT_PASSWORD`: the starting password for admin accounts. Keep it in `.env.local` only; this repo is public.

   ```
   ADMIN_EMAILS=you@example.com,partner@example.com
   ```

2. Create the admin accounts. They get the default password. Re-run this after adding emails to `ADMIN_EMAILS`:

   ```bash
   npm run admins
   ```

3. Recommended: in the Supabase dashboard, open **Authentication → Sign In / Providers** and turn off **Allow new users to sign up**.

No email setup is needed; sign-in doesn't send any email.

### Signing in

Go to `/admin` and sign in with your email and password. Only emails in `ADMIN_EMAILS` can sign in. Wrong passwords and non-admin emails get the same "Incorrect email or password" message.

To change or reset a password, run:

```bash
npm run admins -- set-password you@example.com
```

Leave the password empty to reset it to `ADMIN_DEFAULT_PASSWORD`. Change the default after your first sign-in. Passwords must be at least 12 characters.

### Importing from Excel

Click **Download template**, fill it in Excel, and save it as `.xlsx` or `.csv`. The columns are `name`, `party_size`, `phone`, `email` and `notes`; headers like "Party Size" or "Seats" also work. Upload it and check the preview. Rows marked duplicate or invalid are explained and skipped. Then click **Import**.

Removing someone from `ADMIN_EMAILS` locks them out on their next page load.

## Managing guests from the command line

The admin page covers all of this. The script is handy for scripting or bulk QR export.

1. **Write your guest list** as a CSV (see `scripts/guests.example.csv`):

   ```csv
   name,party_size,phone,email,notes
   Maria & Jose Santos,2,+639171234567,maria@example.com,Bride's aunt
   ```

   `party_size` is the maximum number of people that guest can RSVP for. `notes` are private and never shown.

2. **Import it.** Re-running is safe; names already in the list are skipped.

   ```bash
   npm run guests -- import guests.csv
   ```

3. **Export the links.** Set `NEXT_PUBLIC_SITE_URL` to your real domain first.

   ```bash
   npm run guests -- export
   ```

   This writes `invites/links.csv` (name, phone, email, link) and a QR code per guest in `invites/qr/`. The `invites/` folder is gitignored.

4. **Send each guest their own link** by WhatsApp, Viber, SMS or email, or print the QR code on a card.

5. **Check progress:**

   ```bash
   npm run guests -- list
   ```

   This shows each guest's RSVP, whether they've opened their link, and their URL. You can also browse the `guests` table in the Supabase Table Editor.

### If a link gets shared

| Command | Effect |
| --- | --- |
| `npm run guests -- reissue <code>` | Guest gets a new link and the old one stops working. Their RSVP is kept. |
| `npm run guests -- revoke <code>` | Disable the link. |
| `npm run guests -- restore <code>` | Re-enable a revoked link. |

## How access works

- `/` shows only the couple's names and asks visitors to use their personal link.
- `/i/<code>` looks up the 12-character random code on the server. Unknown or revoked codes show an "invalid link" page.
- The `guests` table has Row Level Security on with no policies, and anonymous access is revoked. Only the server, using the secret key, can read or write it.
- RSVPs are capped at each guest's `party_size` and close at `rsvpDeadline`.
- Invitation pages are `noindex` and send no referrer, so codes don't leak to search engines or map links.

A guest can still forward their own link. The party-size cap limits the impact, and `reissue` lets you replace a leaked link.

## Deploying

Deploy anywhere that runs Next.js (e.g. Vercel). Add the environment variables from `.env.local` (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `ADMIN_EMAILS`, `NEXT_PUBLIC_SITE_URL`) to the host's settings. `ADMIN_DEFAULT_PASSWORD` is only used by the local `npm run admins` script and isn't needed there.
