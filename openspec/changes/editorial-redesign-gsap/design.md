## Context

Next.js 16 with Cache Components. Server components render the invitation, and content comes from the Payload globals `wedding`, `pageText` and `seo`. `CLAUDE.md` requires all visible content to be CMS-editable. Guests open the page mostly on phones, from chat apps.

## Goals / Non-Goals

**Goals:**
- Look and motion close to the reference demo.
- Content stays server-rendered and editable.
- The page is fast on phones and accessible.

**Non-Goals:**
- Pixel-copying the demo.
- Redesigning `/admin`.
- A CMS-editable colour theme (optional per `CLAUDE.md`, not requested).

## Decisions

1. **Server markup and one motion layer.** The page stays a Server Component. A single client component, `InvitationMotion`, wraps it and animates elements marked with data attributes:
   - `data-split` for line reveals
   - `data-reveal` for image unmasks
   - `data-parallax`
   - `data-scrub` for statement fill
   - `data-draw` for SVG line drawing
   - `data-fade`

   Text stays in the HTML, and the CMS shape is unchanged.
   - *Alternative:* a client component per section. Rejected: it duplicates GSAP setup and moves content into client bundles.
2. **`useGSAP` + `gsap.matchMedia()`.**
   - Animations are registered inside `(prefers-reduced-motion: no-preference)`; under reduced motion nothing is hidden or moved.
   - ScrollSmoother runs only on fine-pointer, wide screens; phones keep native scrolling.
   - `useGSAP` reverts everything on unmount.
3. **No flash of hidden content, no stuck-hidden content.**
   - An inline script adds `motion-pending` to `<html>` before paint, and CSS hides `[data-split]`, `[data-fade]` and `[data-reveal]` only while that class is present.
   - The motion layer removes the class once its timelines are set. A 3-second inline fallback removes it if JavaScript or GSAP fails.
4. **SplitText waits for fonts.** It splits after `document.fonts.ready`, with `autoSplit` + `onSplit` so lines re-split on resize. A `mask: "lines"` gives the slide-up-from-a-clip effect.
5. **Anchor links work with ScrollSmoother.** Clicks on `a[href^="#"]` are intercepted and sent to `smoother.scrollTo(target, true, "top 80px")`.
6. **Photos.**
   - CMS uploads use `next/image`; Blob's domain is added to `images.remotePatterns`.
   - Black-and-white is a CSS `grayscale` filter, so the uploaded originals stay in colour (the link-preview image stays colour too).
   - The hero defaults to `public/couple-hero.jpg`, a portrait crop of the couple's photo. Other photo slots hide when empty, so the layout works with a single photo.
7. **CMS fields.**
   - "Page text" gets a `nav` tab, a `story` tab (label, title, text, photo), a `statement` tab (text, photo), section labels, and a `photos` group for the hero.
   - "Wedding details" events get an optional `photo`.
   - All fields get defaults in `site-content-defaults.ts`.
8. **Palette as CSS tokens** in `globals.css`. The `/admin` pages keep their own white styling.

## Risks / Trade-offs

- [Heavy motion on low-end phones] → No smooth scrolling on touch, transforms and opacity only, and few scrubbed elements.
- [Very long names overflow the giant hero type] → The type size uses `clamp()` based on viewport width, and words wrap.
- [Editors upload huge photos] → `next/image` serves resized versions.

## Migration Plan

1. Run the migration for the new fields; `prodMigrations` applies it on deploy.
2. Ship. Rollback: revert the commit. The new columns are harmless.
