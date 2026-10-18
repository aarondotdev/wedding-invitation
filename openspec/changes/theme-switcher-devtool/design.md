## Context

Guest pages (`/i/[code]`, `/`, the invalid-link page) are Server Components styled by CSS tokens in `src/app/(site)/globals.css`:
- colour tokens: `--background`, `--surface`, `--foreground`, `--muted`, `--accent`, `--accent-ink` and `--line`
- three `next/font` families: display, sans and script

The header and hero markup are hard-coded in `src/components/Invitation.tsx`. GSAP (`InvitationMotion`) measures text and layout for SplitText and ScrollTrigger. The guest admin shares the `(site)` layout and the `--accent` token for its buttons, and must not change.

The user chose a **development-only preview**: the panel affects only the developer's browser, and the live look comes from code defaults.

## Goals / Non-Goals

**Goals:**
- Switch theme, fonts, header and layout live on the real page, with no reload.
- One config file declares every preset and the default.
- Production renders exactly the default, ships no switcher code, and doesn't download non-default fonts.
- The admin and `/cms` are unaffected.

**Non-Goals:**
- Live-site switching, per-visitor themes, or CMS-controlled themes. A later change could move the default into a CMS "Theme" global (`CLAUDE.md` recommends that if colours or fonts become owner-editable); the user explicitly chose code defaults for now.
- A visual theme editor (colour pickers). Presets are edited in the config.

## Decisions

### 1. Config is the single source of truth (`src/theme/config.ts`)
```ts
export const themeConfig = {
  defaults: { theme: "white-burgundy-gold", font: "bodoni-outfit", header: "bar", layout: "editorial" },
  themes: [{ id, label, colors: { background, surface, foreground, muted, accent, accentInk, line, glow } }],
  fonts:  [{ id, label, display: "bodoniModa", sans: "outfit", script: "greatVibes" }],
  headers: [{ id: "bar", label: "Bar" }, ...],
  layouts: [{ id: "editorial", label: "Editorial" }, ...],
} satisfies ThemeConfig;
```
- **Themes and font pairings are pure data.** Adding one is a config entry; a new font also needs a `next/font` declaration in `src/theme/fonts.ts`.
- **Headers and layouts reference implemented variants.** Adding one needs a config entry plus its CSS.
- *Alternative:* a CSS-only registry. Rejected: there's no single place to see or extend the options.

### 2. Theme scope is the guest page wrapper, not `<html>`
- Guest page roots get `data-theme-scope`, along with inline CSS custom properties for the active palette (generated from config) and `data-font`, `data-header` and `data-layout` attributes. The roots are the `InvitationMotion` root, the home `<main>` and the invalid-link `<main>`.
- The server renders the defaults. The `:root` values in `globals.css` stay as they are, so the admin (which reads `--accent` at `:root`) keeps its current look.
- *Alternative:* attributes on `<html>`. Rejected: changing the default palette would recolour the admin's buttons.

### 3. Fonts: self-hosted, declare all candidates, preload only the default
- `src/theme/fonts.ts` declares every family once with `next/font/local`, each with a CSS variable (for example `--ff-bodoni-moda`). The files are Latin-subset variable `.woff2` files from Google Fonts (SIL OFL), stored in `src/theme/fonts/` (about 300 KB in total).
- Non-default families use `preload: false`, so browsers only download them when a preview uses them.
- Font roles (`--font-display`, `--font-sans`, `--font-script`) are set as inline variables on the theme scope, alongside the palette, instead of generated `[data-font]` CSS.
- *Changed during implementation:* `next/font/google` was dropped because, with eight families, the dev server's parallel downloads from `fonts.gstatic.com` kept timing out and turning guest pages into 500 errors. That had happened intermittently with three families too. The user chose self-hosting.

### 4. Header and layout variants are CSS-driven, with one markup tree
- The header renders a superset: monogram, nav links, RSVP pill and menu button. The hero renders one tree.
- Variants are selected with `data-header` and `data-layout` attribute selectors (in `globals.css` or arbitrary Tailwind variants). The server markup stays identical, so switching needs no re-render and there are no hydration mismatches.
- **Headers:**
  - `bar`: current blurred bar
  - `transparent`: no background until the hero has scrolled past, then a bar. A `data-scrolled` flag is toggled by an `IntersectionObserver` on the hero.
  - `centered`: monogram centred, links split either side
  - `minimal`: monogram plus a menu button that opens a full-screen nav overlay. This is a small client component, accessible, with Escape to close.
- **Layouts (hero):**
  - `editorial`: current diagonal greeting, names and date
  - `centered`: everything stacked and centred
  - `split`: photo on one side, names and details on the other on desktop; falls back to `centered` when there's no hero photo
- *Alternative:* React variant components chosen by state. Rejected: it would move the page to the client or need cookies, which makes guest pages dynamic per preference.

### 5. Development-only switcher
- `ThemeSwitcher` is a client component loaded with `next/dynamic` inside `process.env.NODE_ENV === "development"`, so production builds drop it.
- It's a collapsed pill at bottom-right (above the Next.js dev indicator and React Grab) that expands into four select lists plus **Reset**.
- It writes `data-*` attributes and inline palette variables on every `[data-theme-scope]` element.
- It saves the choice to `localStorage` (`wedding-theme-preview`), validated against config ids, so a removed preset falls back to its default.
- A tiny dev-only inline script reapplies the saved preview before paint to avoid a flash on reload.

### 6. Keep GSAP in sync
After a switch, the switcher dispatches a `themechange` event. `InvitationMotion` listens and calls `ScrollTrigger.refresh()`; SplitText's `autoSplit` re-splits when fonts change.

## Risks / Trade-offs

- [Variant CSS grows over time] → Keep each header and layout variant's rules grouped and commented in one place.
- [Alternative fonts add `@font-face` CSS to production] → A few hundred bytes. With `preload: false`, guests never download the files.
- [A preview could hide real problems] → **Reset** returns to the default, and the default stays what production renders.
- [Some combinations may look poor, e.g. `split` with no photo] → `split` falls back to `centered`. Combinations are previewed, not enforced.

## Open Questions

- Which extra theme and font presets to include beyond the three palettes and current pairing? The proposal lists starting candidates; easy to change in config.
