"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Interactive parts of the header variants (see the header rules in globals.css):
 * - marks the header `data-scrolled` once the hero is out of view (used by the "transparent" header)
 * - the menu button and full-screen menu (shown by the "minimal" header)
 */
export default function HeaderMenu({
  links,
  rsvp,
  menuLabel,
  closeLabel,
}: {
  links: Array<[href: string, label: string]>;
  rsvp: [href: string, label: string];
  menuLabel: string;
  closeLabel: string;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const header = button.current?.closest("header");
    const hero = document.getElementById("top");
    if (!header || !hero) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.1) header.removeAttribute("data-scrolled");
      else header.setAttribute("data-scrolled", "");
    }, { threshold: [0, 0.1] });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    dialog.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    button.current?.focus();
  };

  return (
    <>
      <button
        ref={button}
        type="button"
        data-hdr-menu
        aria-label={menuLabel}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="h-10 w-10 flex-col items-center justify-center gap-1.5 text-foreground"
      >
        <span aria-hidden className="block h-px w-6 bg-current" />
        <span aria-hidden className="block h-px w-6 bg-current" />
      </button>
      {open && (
        <div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={menuLabel}
          className="fixed inset-0 z-[60] flex flex-col bg-background px-6 py-5 md:px-12"
        >
          <button
            type="button"
            aria-label={closeLabel}
            onClick={close}
            className="ml-auto flex h-10 w-10 items-center justify-center text-3xl leading-none text-foreground"
          >
            <span aria-hidden>×</span>
          </button>
          <nav className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            {links.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="font-display text-4xl transition-colors hover:text-accent-ink md:text-5xl">
                {label}
              </a>
            ))}
            <a
              href={rsvp[0]}
              onClick={() => setOpen(false)}
              className="mt-6 rounded-full border border-accent px-8 py-3 text-xs font-medium uppercase tracking-[0.3em] text-accent-ink transition-colors hover:bg-accent-ink hover:text-background"
            >
              {rsvp[1]}
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
