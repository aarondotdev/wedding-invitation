# Wedding Invitation

A Next.js wedding invitation where every guest gets a personal link (`/i/<code>`). Only people with a valid link can see the invitation and RSVP. Guests and RSVPs are stored in Supabase.

## Setup

1. Copy `.env.example` to `.env.local` and fill in:
   - `SUPABASE_URL`: your project URL
   - `SUPABASE_SECRET_KEY`: Supabase dashboard → Project Settings → API Keys → **Secret keys** (`sb_secret_...`). Server-only; never commit it or prefix it with `NEXT_PUBLIC_`.
   - `NEXT_PUBLIC_SITE_URL`: the address guests will open, e.g. `https://ourwedding.com`
2. `npm install`
3. `npm run dev`, then open a guest link such as `http://localhost:3000/i/<code>`

Edit names, dates, venues and the RSVP deadline in `src/lib/wedding.ts`.

## Guest admin page (`/admin/guests`)

Add guests, copy their links, download QR codes, import a list from Excel, and track RSVPs in the browser.

### One-time setup

1. In `.env.local`, set `SUPABASE_PUBLISHABLE_KEY` (Project Settings → API Keys → Publishable key) and `ADMIN_EMAILS`, the comma-separated emails allowed to sign in:

   ```
   ADMIN_EMAILS=you@example.com,partner@example.com
   ```

2. Create the admin accounts. Re-run this after changing `ADMIN_EMAILS`:

   ```bash
   npm run admins
   ```

3. In the Supabase dashboard, open **Authentication → Email Templates → Magic Link** and replace the body with the following. It sends both a code and a link:

   ```html
   <h2>Sign in to the guest admin</h2>
   <p>Your sign-in code is: <strong>{{ .Token }}</strong></p>
   <p>Or, on this device, <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">click here to sign in</a>.</p>
   ```

4. In **Authentication → URL Configuration**, set **Site URL** to your site's address (`http://localhost:3000` while developing).
5. Recommended: in **Authentication → Sign In / Providers**, turn off **Allow new users to sign up**. Admin accounts come from `npm run admins`, so nobody else needs to sign up.

### Signing in

Go to `/admin`, enter your email, then type the code from the email or click its link. Only emails in `ADMIN_EMAILS` receive a code. Anyone else sees the same screen, but no email is sent. Supabase's built-in email sender allows only a few emails per hour, which is fine for two admins. Add custom SMTP in Supabase if you need more.

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

Deploy anywhere that runs Next.js (e.g. Vercel). Add the environment variables from `.env.local` (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `ADMIN_EMAILS`, `NEXT_PUBLIC_SITE_URL`) to the host's settings, and set the Supabase **Site URL** to your production domain.
