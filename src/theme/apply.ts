import type { CSSProperties } from "react";
import { themeConfig } from "./config";
import { families } from "./fonts";
import type { ThemeSelection } from "./types";

export const PREVIEW_STORAGE_KEY = "wedding-theme-preview";

// Keep only ids that exist in the config; anything else falls back to the default
export function resolveSelection(partial: Partial<ThemeSelection> | null | undefined): ThemeSelection {
  const d = themeConfig.defaults;
  const pick = (list: ReadonlyArray<{ id: string }>, id: unknown, fallback: string) =>
    typeof id === "string" && list.some((item) => item.id === id) ? id : fallback;
  return {
    theme: pick(themeConfig.themes, partial?.theme, d.theme),
    font: pick(themeConfig.fonts, partial?.font, d.font),
    header: pick(themeConfig.headers, partial?.header, d.header),
    layout: pick(themeConfig.layouts, partial?.layout, d.layout),
  };
}

// CSS custom properties for a selection: the palette plus which font family each role uses
export function scopeVariables(selection: ThemeSelection): Record<string, string> {
  const theme = themeConfig.themes.find((t) => t.id === selection.theme) ?? themeConfig.themes[0];
  const font = themeConfig.fonts.find((f) => f.id === selection.font) ?? themeConfig.fonts[0];
  const c = theme.colors;
  return {
    "--background": c.background,
    "--surface": c.surface,
    "--foreground": c.foreground,
    "--muted": c.muted,
    "--accent": c.accent,
    "--accent-ink": c.accentInk,
    "--line": c.line,
    "--glow-inner": c.glowInner,
    "--glow-outer": c.glowOuter,
    "--font-display": `var(${families[font.display].cssVar})`,
    "--font-sans": `var(${families[font.sans].cssVar})`,
    "--font-script": `var(${families[font.script].cssVar})`,
  };
}

/**
 * Props for a guest page's root element. The theme only applies inside these "scopes", so the
 * guest admin and CMS keep their own look whatever the default theme is.
 */
export function themeScopeProps(selection: ThemeSelection = themeConfig.defaults) {
  return {
    "data-theme-scope": "",
    "data-theme": selection.theme,
    "data-font": selection.font,
    "data-header": selection.header,
    "data-layout": selection.layout,
    style: scopeVariables(selection) as CSSProperties,
    // The dev theme switcher may restore a saved preview before React hydrates
    suppressHydrationWarning: true,
  };
}

// Apply a selection to every scope on the page (used by the dev switcher)
export function applySelection(selection: ThemeSelection) {
  const vars = scopeVariables(selection);
  document.querySelectorAll<HTMLElement>("[data-theme-scope]").forEach((el) => {
    el.dataset.theme = selection.theme;
    el.dataset.font = selection.font;
    el.dataset.header = selection.header;
    el.dataset.layout = selection.layout;
    for (const [name, value] of Object.entries(vars)) el.style.setProperty(name, value);
  });
}
