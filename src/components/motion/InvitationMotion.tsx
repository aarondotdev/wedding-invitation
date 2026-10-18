"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText, DrawSVGPlugin);

/**
 * Animates server-rendered markup by data attributes, so all text stays in the HTML and the CMS:
 *   data-hero-title   names rise in letter by letter on load
 *   data-split        lines slide up from a mask when scrolled into view
 *   data-fade         fades and rises into view
 *   data-reveal       image unmasks from the bottom while its photo settles from a zoom
 *   data-parallax     drifts slower than the page (value = strength, e.g. "12")
 *   data-scrub        words light up one by one as the section is scrolled through
 *   data-draw         SVG paths draw themselves
 * Nothing moves when the visitor prefers reduced motion. Smooth scrolling is desktop-only.
 */
export default function InvitationMotion({ header, children }: { header: ReactNode; children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const root = document.documentElement;
      let mm: gsap.MatchMedia | undefined;
      let cancelled = false;

      // Anchor links scroll smoothly; with ScrollSmoother they must go through it
      const onClick = contextSafe!((event: MouseEvent) => {
        const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
        const target = link && document.querySelector(link.getAttribute("href")!);
        if (!target) return;
        event.preventDefault();
        const smoother = ScrollSmoother.get();
        if (smoother) smoother.scrollTo(target, true, "top 72px");
        else target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      });
      scope.current!.addEventListener("click", onClick);

      // SplitText must measure the real fonts, so wait for them before building anything
      document.fonts.ready.then(() => {
        if (cancelled) return;
        mm = gsap.matchMedia();

        mm.add(
          {
            motion: "(prefers-reduced-motion: no-preference)",
            smooth: "(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (pointer: fine)",
          },
          (ctx) => {
            const { motion, smooth } = ctx.conditions as { motion: boolean; smooth: boolean };
            if (!motion) return;

            if (smooth) {
              ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1.1, effects: false });
            }

            const q = gsap.utils.selector(scope);

            // Hero: names rise letter by letter, then the supporting text and portrait settle in
            const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
            q<HTMLElement>("[data-hero-title]").forEach((el) => {
              // Split into words first so the browser never wraps a name between two letters
              const split = SplitText.create(el, { type: "words,chars", mask: "chars" });
              intro.from(split.chars, { yPercent: 115, duration: 1.4, stagger: 0.035 }, 0.2);
            });

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
              const tl = gsap.timeline({
                scrollTrigger: { trigger: el, start: "top 85%", once: true },
                defaults: { duration: 1.6, ease: "expo.inOut" },
              });
              tl.from(el, { clipPath: "inset(100% 0% 0% 0%)" });
              if (img) tl.from(img, { scale: 1.3, duration: 2, ease: "expo.out" }, 0.2);
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

            q<SVGPathElement>("[data-draw] path").forEach((path) => {
              gsap.from(path, {
                drawSVG: 0,
                duration: 2.2,
                ease: "power2.inOut",
                scrollTrigger: { trigger: path.closest("[data-draw]")!, start: "top 85%", once: true },
              });
            });
          },
        );

        // Starting states are set, so hidden elements can be shown without a flash
        root.classList.remove("motion-pending");
        ScrollTrigger.refresh();
      });

      return () => {
        cancelled = true;
        scope.current?.removeEventListener("click", onClick);
        mm?.revert();
      };
    },
    { scope },
  );

  return (
    <div ref={scope} className="flex flex-1 flex-col">
      {header}
      <div id="smooth-wrapper">
        <div id="smooth-content">{children}</div>
      </div>
    </div>
  );
}
