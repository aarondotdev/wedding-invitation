## Why

The invitation's look keeps changing as the couple explores options: espresso and gold, then dark burgundy and gold, then white with burgundy and gold, plus several hero layouts. Each change has meant editing CSS and components and taking new screenshots. A small developer panel that switches between saved presets lets us compare looks on the real page in seconds, and makes adding a new option a matter of editing one config file.

## What Changes

- Add a **theme switcher panel** fixed to the bottom-right corner of guest pages. It renders **only in local development** (`npm run dev`) and is never shipped to production.
- The panel switches four independent dimensions, each a list of presets:
  - **Theme:** colour palettes, such as the current white with burgundy and gold, the dark burgundy and gold, and the original espresso and gold.
  - **Fonts:** heading, body and script font pairings.
  - **Header:** variants such as the current blurred bar, a transparent header that turns solid on scroll, centred monogram, and minimal (monogram plus menu button).
  - **Layout:** hero layout variants, such as the current editorial diagonal, a centred stack, and a split with the photo on one side and the names on the other.
- **All presets and the default selection live in one config file** (`src/theme/config.ts`), so adding a theme, font pairing, header or layout means adding an entry there.
- Choices apply instantly and persist in that browser (`localStorage`), with a **Reset to default** action. They never affect other visitors or the live site.
- The live site keeps using the defaults from the config file. The current white with burgundy and gold is the default, so nothing changes visually for guests.
- Refactor the existing colour tokens, fonts, header and hero so they're driven by the active preset (CSS variables and `data-*` attributes on `<html>`) instead of being hard-coded.

## Capabilities

### New Capabilities
- `theme-presets`: A config-driven registry of themes, font pairings, headers and layouts, with a default that guest pages render.
- `theme-switcher-devtool`: A development-only bottom-right panel that previews presets live, persists the choice per browser and resets to the default.

### Modified Capabilities
<!-- invitation-design is not formally specced under openspec/specs; visible behaviour for guests is unchanged. -->

## Impact

- **Code:**
  - new `src/theme/` (config, types, apply helpers) and `src/components/dev/ThemeSwitcher.tsx`
  - `src/app/(site)/layout.tsx` (fonts and `data-*` attributes)
  - `globals.css` (header and hero variant CSS; palettes are applied as inline variables from the config)
  - `Invitation.tsx` (header and hero variants)
- **Fonts:** self-hosted with `next/font/local` (8 Latin `.woff2` files, about 300 KB, SIL OFL) instead of Google downloads, which timed out in dev. `preload: false` for non-default fonts so guests don't download them.
- **CMS:** two small Page text fields, Menu and Close, for the minimal header's button labels (migration `header_menu_labels`). No new dependencies.
- **Guest admin and `/cms` are untouched.**
