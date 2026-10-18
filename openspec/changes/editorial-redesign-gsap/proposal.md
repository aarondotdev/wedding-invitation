## Why

The couple wants the invitation to feel like the editorial, motion-rich style of the Bricksfly "Dance" demo: a dark warm palette, oversized serif type, black-and-white photography, and GSAP scroll animation. The current page is a light, static template.

## What Changes

- **Visual redesign** of the guest-facing pages (invitation, home, invalid link):
  - **Palette:** warm near-black with ivory text and gold hairline accents
  - **Type:** Bodoni Moda display headings, Outfit body text, Great Vibes for the signature
  - **Layout:** numbered section labels with hairline rules
  - **Hero:** giant names overlapping an arched portrait
  - **Sections:** alternating event rows, a giant scroll-filled statement, a hairline schedule table, and a large RSVP call to action
- **GSAP animation:**
  - smooth scrolling (ScrollSmoother, desktop only)
  - headings revealing line by line (SplitText)
  - photos unmasking with parallax
  - the statement filling word by word as you scroll
  - gold hand-drawn lines drawing themselves (DrawSVG)
  - honours "reduce motion", and content stays visible if scripts fail
- **New CMS content** (per `CLAUDE.md`):
  - in "Page text": navigation labels, an "Our story" section (label, title, text), the statement text, and section labels
  - photo uploads for the hero, story and statement, and per event in "Wedding details"
  - every photo is optional except the hero, which defaults to the bundled couple photo
- The guest admin (`/admin`) and the CMS UI are unchanged. The design is our own implementation inspired by the demo; no code, fonts or images are copied from it.

## Capabilities

### New Capabilities
- `invitation-design`: Editorial layout, typography and GSAP motion for guest-facing pages, with accessible fallbacks and CMS-driven content and photos.

### Modified Capabilities
<!-- cms-content gains fields; covered in this change's spec. -->

## Impact

- **Dependencies:** `gsap` 3.15 (all plugins are free) and `@gsap/react`.
- **Fonts:** Bodoni Moda and Outfit via `next/font`; Cormorant Garamond is dropped.
- **Database:** one migration for the new text and photo fields.
- **Code:** `src/components/Invitation.tsx` (rewritten), new `src/components/motion/*`, `globals.css` tokens, home and invalid-link pages, `PageText`/`Wedding` globals, defaults, `next.config.ts` (`images.remotePatterns` for Blob).
