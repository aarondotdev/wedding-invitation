"use client";

import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText, DrawSVGPlugin);

/**
 * Animates server-rendered markup by data attributes, so all text stays in the HTML and the CMS:
 *   data-split        lines slide up from a mask when scrolled into view
 *   data-fade         fades and rises into view
 *   data-reveal       image unmasks from the bottom while its photo settles from a zoom
 *   data-parallax     drifts slower than the page (value = strength, e.g. "12")
 *   data-drift        collage tile floats against the scroll, wide screens only (value = strength, sign = direction)
 *   data-timeline     its [data-timeline-fill] line grows with the scroll; [data-timeline-dot]s fill gold as it passes
 *   data-scrub        words light up one by one as the section is scrolled through
 *   data-draw         SVG paths draw themselves
 *   data-hscroll      section pins and its [data-hscroll-track] scrolls sideways (wide screens only)
 *   data-colorize     image turns from black-and-white to colour as it comes into view
 * Nothing moves when the visitor prefers reduced motion. Smooth scrolling is desktop-only.
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
            setCoverOpen(true);
            document.dispatchEvent(new CustomEvent("invitation-opened"));
          };
          // Let the envelope beat once (see the cover's data-beating styles) before the page opens
          if (matchMedia("(prefers-reduced-motion: reduce)").matches) open();
          else if (!openButton.hasAttribute("data-beating")) {
            openButton.setAttribute("data-beating", "");
            window.setTimeout(open, 1000);
          }
          return;
        }

        const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
        const target = link && document.querySelector(link.getAttribute("href")!);
        if (!target) return;
        event.preventDefault();
        const smoother = ScrollSmoother.get();
        if (smoother) smoother.scrollTo(target, true, "top 72px");
        else target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
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
            motion: "(prefers-reduced-motion: no-preference)",
            wide: "(prefers-reduced-motion: no-preference) and (min-width: 1024px)",
            smooth: "(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (pointer: fine)",
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
