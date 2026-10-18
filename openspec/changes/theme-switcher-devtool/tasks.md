## 1. Preset registry

- [x] 1.1 `src/theme/types.ts`: `ThemeConfig`, `ThemePreset`, `FontPairing`, `HeaderVariant`, `LayoutVariant`, `ThemeSelection`
- [x] 1.2 `src/theme/fonts.ts`: declare every `next/font` family once with its own CSS variable; `preload: false` for families not in the default pairing
- [x] 1.3 `src/theme/config.ts`: themes (white with burgundy and gold as the default, dark burgundy and gold, espresso and gold), font pairings (Bodoni Moda + Outfit as the default, plus at least one alternative), headers (`bar`, `transparent`, `centered`, `minimal`), layouts (`editorial`, `centered`, `split`), defaults
- [x] 1.4 `src/theme/apply.ts`: helpers that turn a selection into scope attributes and inline palette variables, generate `[data-font]` CSS from the config, and validate a saved selection against config ids

## 2. Render defaults on guest pages

- [x] 2.1 Site layout loads the fonts from `src/theme/fonts.ts`; `:root` tokens stay unchanged so the admin and `/cms` are unaffected
- [x] 2.2 Add `data-theme-scope` with the default attributes and palette to the invitation root, home `<main>` and invalid-link `<main>`
- [x] 2.3 Verify the default render matches the current look (screenshots before and after)

## 3. Header and layout variants

- [x] 3.1 Header superset markup (monogram, links, RSVP pill, menu button) with variant CSS for `bar`, `transparent`, `centered`, `minimal`
- [x] 3.2 `transparent`: toggle `data-scrolled` when the hero leaves the viewport (`IntersectionObserver`)
- [x] 3.3 `minimal`: accessible full-screen nav overlay (focus moves into it, Escape closes it, links close it)
- [x] 3.4 Hero variant CSS for `editorial`, `centered`, `split` (`split` falls back to `centered` without a photo); no overlaps from 390 to 1920 px

## 4. Development-only switcher

- [x] 4.1 `src/components/dev/ThemeSwitcher.tsx`: collapsed bottom-right pill that expands into four labelled selects plus **Reset**; keyboard-operable, Escape closes it
- [x] 4.2 Apply choices to every `[data-theme-scope]`; persist to `localStorage` (`wedding-theme-preview`) with validation; dispatch `themechange`
- [x] 4.3 Dev-only inline script that reapplies the saved preview before paint
- [x] 4.4 Load the switcher via `next/dynamic` inside a `NODE_ENV === "development"` check; `InvitationMotion` refreshes ScrollTrigger on `themechange`

## 5. Verification and docs

- [x] 5.1 Lint, types and production build pass; no switcher code or markup in the production output
- [x] 5.2 Guests only download the default fonts (check network requests)
- [x] 5.3 Every theme × header × layout renders without overlaps on desktop and phone; animations stay correct after switching
- [x] 5.4 Admin pages unchanged (button colours identical)
- [x] 5.5 README "Theme switcher" section (how to use it and how to add a preset); `CLAUDE.md` design notes updated
