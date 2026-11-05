"use client";

import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { MOTION_OK_QUERY, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText, DrawSVGPlugin);

/**
 * Animates server-rendered markup by data attributes, so all text stays in the HTML and the CMS:
 *   data-split        lines slide up from a mask when scrolled into view
 *   data-fade         fades and rises into view
 *   data-cover-envelope / data-cover-fade   on the cover: tapping [data-cover-open] zooms the envelope
 *                     alone (its frame stays, the text fades), flashes, then opens the page
 *   data-intro        plays once, in page order, as soon as the invitation is opened (or on load without
 *                     a cover): "mark" settles in from a soft blur, "chars" brings letters up one by one,
 *                     "type" is typed letter by letter,
 *                     "spread" closes in from wide letter-spacing; anything else fades and rises
 *   data-reveal       image unmasks from the bottom while its photo settles from a zoom
 *   data-parallax     drifts slower than the page (value = strength, e.g. "12")
 *   data-pin-cover    section stays still: uncovered by the section above, then covered by the next one
 *                     (both directions)
 *   data-drift        collage tile floats against the scroll, wide screens only (value = strength, sign = direction)
 *   data-timeline     its [data-timeline-fill] line grows with the scroll; [data-timeline-dot]s fill gold as it passes
 *   data-scrub        words light up one by one as the section is scrolled through
 *   data-draw         SVG paths draw themselves
 *   data-hscroll      section pins and its [data-hscroll-track] scrolls sideways (wide screens only)
 *   data-colorize     image turns from black-and-white to colour as it comes into view
 * Animations also play with the device's reduced-motion setting (see lib/motion.ts). Smooth scrolling is desktop-only.
 */
export default function InvitationMotion({
  header,
  cover,
  backdrop,
  scope,
  children,
}: {
  header?: ReactNode;
  cover?: ReactNode;
  // Fixed decoration behind the page (e.g. drifting dust); sections with their own background cover it
  backdrop?: ReactNode;
  // Theme scope props from themeScopeProps(): palette, fonts, header and layout for this page
  scope: HTMLAttributes<HTMLDivElement> & Record<`data-${string}`, string>;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [coverOpen, setCoverOpen] = useState(!cover);
  // Read inside GSAP callbacks, which don't see state updates
  const opened = useRef(!cover);

  // Behind a cover the page must always open from the top: stop the browser restoring the
  // previous scroll position on refresh, and reset it when the cover is opened.
  useEffect(() => {
    if (!cover) return;
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    return () => {
      history.scrollRestoration = previous;
    };
  }, [cover]);

  // While the cover is shown nothing scrolls: not the cover itself, and not the page behind it
  useEffect(() => {
    if (!cover || coverOpen) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previous;
    };
  }, [cover, coverOpen]);

  const pageScope = coverOpen
    ? {
        ...scope,
        style: {
          ...scope.style,
          "--background": "#35090d",
          "--surface": "#451118",
          "--foreground": "#f6eee3",
          "--muted": "#d4b5ae",
          "--accent": "#d4ae62",
          "--accent-ink": "#d4ae62",
          "--line": "rgb(212 174 98 / 0.22)",
          "--glow-inner": "rgb(212 174 98 / 0.16)",
          "--glow-outer": "transparent",
        } as CSSProperties,
      }
    : scope;

  useGSAP(
    (_, contextSafe) => {
      const html = document.documentElement;
      let mm: gsap.MatchMedia | undefined;
      let cancelled = false;

      // Anchor links scroll smoothly; with ScrollSmoother they must go through it
      const onClick = contextSafe!((event: MouseEvent) => {
        const openButton = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-cover-open]");
        if (openButton) {
          const open = () => {
            ScrollSmoother.get()?.scrollTop(0);
            window.scrollTo(0, 0);
            opened.current = true;
            setCoverOpen(true);
            document.dispatchEvent(new CustomEvent("invitation-opened"));
          };
          if (prefersReducedMotion()) {
            open();
            return;
          }
          if (openButton.hasAttribute("data-opening")) return; // already on its way in
          openButton.setAttribute("data-opening", "");

          // Zoom into the envelope, flash, then open the page while the flash fades away.
          // The flash lives on <body> so it outlasts the cover, which unmounts when the page opens.
          const cover = openButton.closest<HTMLElement>("[role=dialog]") ?? openButton;
          const envelope = cover.querySelector<HTMLElement>("[data-cover-envelope]");
          const others = [...cover.querySelectorAll<HTMLElement>("[data-cover-fade]")];
          const flash = document.createElement("div");
          flash.setAttribute("aria-hidden", "true");
          Object.assign(flash.style, {
            position: "fixed",
            inset: "0",
            zIndex: "200",
            pointerEvents: "none",
            opacity: "0",
            background: "radial-gradient(circle at 50% 50%, #fffdf6 0%, #fff4dc 45%, #f3dca0 100%)",
          });
          document.body.appendChild(flash);

          // Slow and soft throughout: the envelope drifts larger with a gentle start and finish while
          // the text fades, a warm light blooms over its last moments, and the page opens behind it
          const tl = gsap.timeline({ onComplete: () => flash.remove() });
          tl.to(others, { autoAlpha: 0, duration: 0.8, ease: "sine.out" }, 0);
          if (envelope) {
            // Only the envelope (not its frame), from its centre
            tl.to(envelope, { scale: 1.5, duration: 2.4, ease: "power2.inOut", transformOrigin: "50% 50%" }, 0);
          }
          tl.to(flash, { opacity: 1, duration: 0.6, ease: "sine.in" }, envelope ? 1.8 : 0)
            .call(open)
            .to(flash, { opacity: 0, duration: 1.3, ease: "sine.out" }, "+=0.15");
          return;
        }

        const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
        const target = link && document.querySelector(link.getAttribute("href")!);
        if (!target) return;
        event.preventDefault();
        const smoother = ScrollSmoother.get();
        if (smoother) smoother.scrollTo(target, true, "top 72px");
        else target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
      });
      root.current!.addEventListener("click", onClick);

      // The dev theme switcher changed fonts or layout: re-measure every scroll animation
      const onThemeChange = () => ScrollTrigger.refresh();
      window.addEventListener("themechange", onThemeChange);

      // SplitText must measure the real fonts, so wait for them before building anything
      document.fonts.ready.then(() => {
        if (cancelled) return;
        mm = gsap.matchMedia();

        mm.add(
          {
            // MOTION_OK_QUERY: animations play even with the device's reduced-motion setting (see lib/motion.ts)
            motion: MOTION_OK_QUERY,
            wide: `${MOTION_OK_QUERY} and (min-width: 1024px)`,
            smooth: `${MOTION_OK_QUERY} and (min-width: 1024px) and (pointer: fine)`,
          },
          (ctx) => {
            const { motion, wide, smooth } = ctx.conditions as { motion: boolean; wide: boolean; smooth: boolean };
            if (!motion) return;
            const cleanups: Array<() => void> = [];

            if (smooth) {
              ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1.1, effects: false });
            }

            const q = gsap.utils.selector(root);

            q<HTMLElement>("[data-split]").forEach((el) => {
              SplitText.create(el, {
                type: "lines",
                mask: "lines",
                autoSplit: true,
                onSplit: (self) =>
                  gsap.from(self.lines, {
                    yPercent: 110,
                    duration: 1.2,
                    stagger: 0.09,
                    ease: "expo.out",
                    scrollTrigger: { trigger: el, start: "top 88%", once: true },
                  }),
              });
            });

            q<HTMLElement>("[data-fade]").forEach((el) => {
              gsap.from(el, {
                autoAlpha: 0,
                y: 40,
                duration: 1.2,
                ease: "power3.out",
                delay: Number(el.dataset.fade) || 0,
                scrollTrigger: { trigger: el, start: "top 90%", once: true },
              });
            });

            // Hero entrance: one timeline in page order, held until the envelope is opened so it
            // isn't spent behind the cover
            const introEls = q<HTMLElement>("[data-intro]");
            if (introEls.length) {
              const intro = gsap.timeline({ paused: true });
              let previousTyped = false;
              introEls.forEach((el, i) => {
                const typed = el.dataset.intro === "type";
                // A short beat, then each step starts while the previous one settles; typing starts early,
                // over the logo, and a typed line that follows another carries straight on
                const at = i === 0 ? 0.15 : typed ? (previousTyped ? "+=0.05" : "-=1.1") : "-=0.75";
                previousTyped = typed;
                switch (el.dataset.intro) {
                  case "mark":
                    intro.from(el, { autoAlpha: 0, scale: 0.82, y: 24, filter: "blur(14px)", duration: 1.6, ease: "expo.out" }, at);
                    break;
                  case "chars": {
                    const split = SplitText.create(el, { type: "chars" });
                    cleanups.push(() => split.revert());
                    intro.from(split.chars, { autoAlpha: 0, yPercent: 70, filter: "blur(6px)", duration: 1, stagger: 0.045, ease: "power3.out" }, at);
                    break;
                  }
                  case "type": {
                    // Typed on a keyboard: letters pop in one at a time at a quick, slightly uneven pace
                    const split = SplitText.create(el, { type: "chars" });
                    const chars = split.chars as HTMLElement[];
                    cleanups.push(() => split.revert());
                    gsap.set(chars, { autoAlpha: 0 });
                    intro.addLabel(`type${i}`, at);
                    let t = intro.labels[`type${i}`];
                    chars.forEach((c, n) => {
                      intro.set(c, { autoAlpha: 1 }, t);
                      // A slightly longer pause at the end of a word, as a typist would before the space
                      const after = c.nextSibling;
                      const wordEnd = !after || (after.nodeType === Node.TEXT_NODE && /\s/.test(after.textContent ?? ""));
                      t += 0.035 + Math.random() * 0.03 + (wordEnd && n < chars.length - 1 ? 0.06 : 0);
                    });
                    break;
                  }
                  case "spread":
                    intro.from(el, { autoAlpha: 0, letterSpacing: "0.9em", duration: 1.4, ease: "power3.out" }, at);
                    break;
                  default:
                    intro.from(el, { autoAlpha: 0, y: 30, duration: 1.2, ease: "power3.out" }, at);
                }
              });
              // `from` tweens apply their start state now, so the elements stay hidden until played
              const play = () => intro.play();
              if (opened.current) play();
              else {
                document.addEventListener("invitation-opened", play, { once: true });
                cleanups.push(() => document.removeEventListener("invitation-opened", play));
              }
            }

            q<HTMLElement>("[data-reveal]").forEach((el) => {
              const img = el.querySelector("img");
              const tl = gsap.timeline({ paused: true, defaults: { duration: 1.6, ease: "expo.inOut" } });
              tl.from(el, { clipPath: "inset(100% 0% 0% 0%)" });
              if (img) tl.from(img, { scale: 1.3, duration: 2, ease: "expo.out" }, 0.2);
              // Play from a callback rather than attaching the timeline to the trigger. ScrollTrigger delays
              // the first measurement of timeline-attached triggers by a tick; when the page loads scrolled
              // past them, the next trigger created force-measures them, these `once` triggers finish and
              // remove themselves mid-loop, and ScrollTrigger crashes ("reading 'end'").
              ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => tl.play() });
            });

            // Section stays still on screen, like a window onto it: the section above slides away to
            // uncover it (and slides back over it when scrolling up), then it holds at the top while the
            // next section scrolls up over it. No pin spacing, so the next section covers it straight away.
            q<HTMLElement>("[data-pin-cover]").forEach((el) => {
              const next = el.nextElementSibling as HTMLElement | null;
              if (next) gsap.set(next, { position: "relative", zIndex: 1 });
              // Arriving: the content moves against the scroll by exactly as much as the section rises,
              // so it appears not to move while the section's top edge (and the section above) passes over it
              gsap.fromTo(
                [...el.children],
                { y: () => -el.offsetHeight },
                { y: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true } },
              );
              ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom top", pin: true, pinSpacing: false });
            });

            q<HTMLElement>("[data-parallax]").forEach((el) => {
              const amount = Number(el.dataset.parallax) || 10;
              gsap.fromTo(
                el,
                { yPercent: -amount },
                {
                  yPercent: amount,
                  ease: "none",
                  scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
                },
              );
            });

            // Collage tiles float at different speeds against the scroll (wide screens only, where the
            // tiles have room; on phones the bento grid is tight and would overlap)
            if (wide) {
              q<HTMLElement>("[data-drift]").forEach((el) => {
                const amount = Number(el.dataset.drift) || 0;
                if (!amount) return;
                gsap.fromTo(
                  el,
                  { yPercent: amount },
                  {
                    yPercent: -amount,
                    ease: "none",
                    scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
                  },
                );
              });
            }

            // Timeline: the line's gold fill grows with the scroll, and each dot fills once the line reaches it
            q<HTMLElement>("[data-timeline]").forEach((tl) => {
              const fill = tl.querySelector<HTMLElement>("[data-timeline-fill]");
              const dots = Array.from(tl.querySelectorAll<HTMLElement>("[data-timeline-dot]"));
              if (!fill) return;
              // Dots are gold by default (no JS / reduced motion); here the ones the line hasn't reached are
              // emptied with inline styles, so no stylesheet rule is involved
              const setEmpty = (dot: HTMLElement, empty: boolean) => {
                dot.style.backgroundColor = empty ? "var(--background)" : "";
                dot.style.boxShadow = empty ? "none" : "";
              };
              dots.forEach((dot) => setEmpty(dot, true));
              cleanups.push(() => dots.forEach((dot) => setEmpty(dot, false)));
              gsap.fromTo(
                fill,
                { scaleY: 0 },
                {
                  scaleY: 1,
                  ease: "none",
                  scrollTrigger: {
                    trigger: tl,
                    start: "top 70%",
                    end: "bottom 70%",
                    scrub: 0.4,
                    onUpdate: (self) => {
                      // Layout positions (offsetTop summed up to the timeline), not bounding boxes: the rows slide
                      // up while fading in, which would misplace the dots mid-animation. +2px so the last dot, at
                      // the very end of the line, fills too.
                      const reached = tl.offsetHeight * self.progress + 2;
                      dots.forEach((dot) => {
                        let mid = dot.offsetHeight / 2;
                        for (let el: HTMLElement | null = dot; el && el !== tl; el = el.offsetParent as HTMLElement | null) mid += el.offsetTop;
                        setEmpty(dot, mid > reached);
                      });
                    },
                  },
                },
              );
            });

            q<HTMLElement>("[data-scrub]").forEach((el) => {
              const split = SplitText.create(el, { type: "words" });
              gsap.fromTo(
                split.words,
                { opacity: 0.18 },
                {
                  opacity: 1,
                  ease: "none",
                  stagger: 0.1,
                  scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
                },
              );
            });

            // Horizontal gallery: the track becomes one long row and moves sideways while the section is pinned
            const sidewaysImages = new Set<Element>();
            if (wide) {
              q<HTMLElement>("[data-hscroll]").forEach((section) => {
                const track = section.querySelector<HTMLElement>("[data-hscroll-track]");
                if (!track) return;
                track.classList.add("is-hscroll");
                cleanups.push(() => track.classList.remove("is-hscroll"));
                const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
                const slide = gsap.to(track, {
                  x: () => -distance(),
                  ease: "none",
                  scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    // Scroll ~60% of the track's width so a long gallery doesn't take ages to get through
                    end: () => `+=${distance() * 0.6}`,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true,
                  },
                });
                track.querySelectorAll("[data-colorize]").forEach((img) => {
                  sidewaysImages.add(img);
                  gsap.fromTo(
                    img,
                    { filter: "grayscale(1)" },
                    {
                      filter: "grayscale(0)",
                      ease: "none",
                      scrollTrigger: { trigger: img, containerAnimation: slide, start: "left 85%", end: "left 35%", scrub: true },
                    },
                  );
                });
              });
            }

            q<HTMLElement>("[data-colorize]").forEach((img) => {
              if (sidewaysImages.has(img)) return;
              gsap.fromTo(
                img,
                { filter: "grayscale(1)" },
                { filter: "grayscale(0)", ease: "none", scrollTrigger: { trigger: img, start: "top 85%", end: "top 35%", scrub: true } },
              );
            });

            q<SVGPathElement>("[data-draw] path").forEach((path) => {
              gsap.from(path, {
                drawSVG: 0,
                duration: 2.2,
                ease: "power2.inOut",
                scrollTrigger: { trigger: path.closest("[data-draw]")!, start: "top 85%", once: true },
              });
            });

            return () => cleanups.forEach((fn) => fn());
          },
        );

        // Starting states are set, so hidden elements can be shown without a flash
        html.classList.remove("motion-pending");
        ScrollTrigger.refresh();
      });

      return () => {
        cancelled = true;
        root.current?.removeEventListener("click", onClick);
        window.removeEventListener("themechange", onThemeChange);
        mm?.revert();
      };
    },
    { scope: root },
  );

  return (
    // `isolate` keeps the backdrop (z -10) above this element's own background but below the page
    <div ref={root} {...pageScope} className="isolate flex flex-1 flex-col bg-background font-sans text-foreground">
      {backdrop}
      {cover && !coverOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Wedding invitation"
          className="paper-texture fixed inset-0 z-[100] overflow-hidden overscroll-none"
          style={{ backgroundColor: "#3b0d18" }}
        >
          {cover}
        </div>
      )}
      <div inert={!coverOpen} aria-hidden={!coverOpen}>
        {header}
        <div id="smooth-wrapper">
          <div id="smooth-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
