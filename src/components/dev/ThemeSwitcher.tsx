"use client";

import { useEffect, useRef, useState } from "react";
import { applySelection, PREVIEW_STORAGE_KEY, resolveSelection } from "@/theme/apply";
import { themeConfig } from "@/theme/config";
import type { ThemeSelection } from "@/theme/types";

/**
 * Development-only panel (bottom right) that previews the presets in src/theme/config.ts on the
 * real page. Choices are saved in this browser only; guests always see the config defaults.
 */
export default function ThemeSwitcher() {
  const [hasScope, setHasScope] = useState(false);
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<ThemeSelection>(themeConfig.defaults);
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  // Pick up the saved preview (already applied before paint by the bootstrap script)
  useEffect(() => {
    let saved: Partial<ThemeSelection> | null = null;
    try {
      saved = JSON.parse(localStorage.getItem(PREVIEW_STORAGE_KEY) ?? "null");
    } catch {}
    const initial = resolveSelection(saved);
    // Mounting reads browser-only state; syncing it into React state here is intentional
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelection(initial);
    setHasScope(document.querySelector("[data-theme-scope]") !== null);
    applySelection(initial);
  }, []);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector("select")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function choose(next: ThemeSelection) {
    setSelection(next);
    applySelection(next);
    try {
      localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(next));
    } catch {}
    // Layout and fonts changed: let the animation layer re-measure
    window.dispatchEvent(new Event("themechange"));
  }

  function reset() {
    try {
      localStorage.removeItem(PREVIEW_STORAGE_KEY);
    } catch {}
    choose(themeConfig.defaults);
    try {
      localStorage.removeItem(PREVIEW_STORAGE_KEY);
    } catch {}
  }

  if (!hasScope) return null;

  const isDefault = (Object.keys(selection) as Array<keyof ThemeSelection>).every(
    (key) => selection[key] === themeConfig.defaults[key],
  );

  const fields: Array<{ key: keyof ThemeSelection; label: string; options: ReadonlyArray<{ id: string; label: string }> }> = [
    { key: "theme", label: "Theme", options: themeConfig.themes },
    { key: "font", label: "Fonts", options: themeConfig.fonts },
    { key: "header", label: "Header", options: themeConfig.headers },
    { key: "layout", label: "Layout", options: themeConfig.layouts },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[80] font-sans text-[13px] font-normal text-neutral-100" style={{ letterSpacing: "normal" }}>
      {open && (
        <div
          ref={panel}
          role="dialog"
          aria-label="Theme switcher"
          className="mb-2 w-72 rounded-xl border border-white/10 bg-neutral-900/95 p-4 shadow-2xl backdrop-blur"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">Theme preview</p>
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-neutral-300">dev only</span>
          </div>
          <div className="space-y-3">
            {fields.map(({ key, label, options }) => (
              <label key={key} className="block">
                <span className="mb-1 block text-[11px] uppercase tracking-wide text-neutral-400">{label}</span>
                <select
                  value={selection[key]}
                  onChange={(e) => choose({ ...selection, [key]: e.target.value })}
                  className="w-full rounded-md border border-white/15 bg-neutral-800 px-2 py-1.5 text-neutral-100 outline-none focus:border-white/40"
                >
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                      {themeConfig.defaults[key] === o.id ? " (default)" : ""}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <p className="text-[11px] leading-snug text-neutral-400">Saved in this browser only. Guests see the defaults.</p>
            <button
              type="button"
              onClick={reset}
              disabled={isDefault}
              className="shrink-0 rounded-md border border-white/15 px-3 py-1.5 hover:bg-white/10 disabled:opacity-40"
            >
              Reset
            </button>
          </div>
        </div>
      )}
      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="ml-auto flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900/95 px-4 py-2 shadow-xl hover:bg-neutral-800"
      >
        <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: "conic-gradient(#5c0f1f, #d4ae62, #2b2723, #5c0f1f)" }} />
        Theme{!isDefault && <span className="text-[11px] text-amber-300">• preview</span>}
      </button>
    </div>
  );
}
