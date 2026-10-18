## Context

The editorial redesign (`editorial-redesign-gsap`) established the layout, the motion layer driven by data attributes, and CMS-driven content. `CLAUDE.md` requires every visible detail to be editable in Payload.

## Decisions

1. **Two new globals, split by what the editor is thinking about.**
   - "Family & entourage" holds people: groups of names as nested arrays, so editors can add, remove and reorder groups and people freely.
   - "Guest details" holds tabs for dress code, Q&A and gallery.
   - *Alternative:* fixed fields per role. Rejected: entourages vary a lot between weddings.
2. **Never saved vs saved arrays.** A never-saved global shows the placeholder content. Once saved, arrays render exactly as edited, and an emptied list hides its block, so editors can remove the FAQ or gallery on purpose.
3. **Image placements follow the reference:**
   - alternating numbered rows (`FeatureRow`) for both the story chapters and the events
   - a full-bleed band with a line running into the statement
   - a small portrait beside the statement and a large landscape below it
4. **Gallery.** Without JavaScript, or on phones, it's a CSS grid. On wide screens with motion allowed, the layer adds `is-hscroll`, pins the section and moves the track sideways. The scroll distance is 60% of the track width so it doesn't drag. Photos colorize through `containerAnimation`.
5. **FAQ uses native `<details>`.** It's accessible and works without JavaScript.
6. **Prenup photos go to Blob through Payload's Local API** (`payload run`). They're resized to 2000 px (6.5 MB total for 26 images), and each has a written description. The originals stay with the couple and the public repo stays photo-free.
7. **`expireTags()` wraps `revalidateTag`.** Payload hooks also run in scripts, where Next's cache store doesn't exist, so the call is ignored there.

## Risks / Trade-offs

- [The page is long] → The gallery scrolls faster than its width, and sections hide when empty.
- [Smooth scrolling interferes with automated clicks in tests] → Tests click in-page. Real wheel and touch scrolling is unaffected.
