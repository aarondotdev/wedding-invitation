import type { ThemeConfig } from "./types";

/**
 * Every look the invitation can take. Guests always see `defaults`; the development-only theme
 * switcher (bottom-right in `npm run dev`) previews the other presets in your browser.
 *
 * - Add a theme: add an entry to `themes` (text colours should reach WCAG AA against `background`).
 * - Add a font pairing: declare any new font in fonts.ts, then add an entry to `fonts`.
 * - Headers and layouts are implemented variants (CSS in globals.css); add an entry here only
 *   together with its CSS.
 */
export const themeConfig = {
  defaults: { theme: "white-burgundy-gold", font: "bodoni-outfit", header: "bar", layout: "editorial" },

  themes: [
    {
      id: "white-burgundy-gold",
      label: "White · burgundy & gold",
      colors: {
        background: "#ffffff",
        surface: "#fbf6f1",
        foreground: "#5c0f1f",
        muted: "#7a4650",
        accent: "#d4ae62",
        accentInk: "#8a6516",
        line: "rgb(212 174 98 / 0.5)",
        glowInner: "rgb(212 174 98 / 0.16)",
        glowOuter: "rgb(92 15 31 / 0.05)",
      },
    },
    {
      id: "burgundy-gold",
      label: "Burgundy & gold (dark)",
      colors: {
        background: "#3b0d18",
        surface: "#4a1420",
        foreground: "#f6eee3",
        muted: "#d4b5ae",
        accent: "#d4ae62",
        accentInk: "#d4ae62",
        line: "rgb(212 174 98 / 0.22)",
        glowInner: "rgb(212 174 98 / 0.16)",
        glowOuter: "rgb(122 28 46 / 0.6)",
      },
    },
    {
      id: "espresso-gold",
      label: "Espresso & gold (dark)",
      colors: {
        background: "#2b2723",
        surface: "#34302b",
        foreground: "#f4efe8",
        muted: "#a8a097",
        accent: "#c8a46a",
        accentInk: "#c8a46a",
        line: "rgb(244 239 232 / 0.14)",
        glowInner: "rgb(122 100 64 / 0.45)",
        glowOuter: "transparent",
      },
    },
  ],

  fonts: [
    { id: "bodoni-outfit", label: "Bodoni Moda + Outfit", display: "bodoniModa", sans: "outfit", script: "greatVibes" },
    { id: "cormorant-jost", label: "Cormorant + Jost", display: "cormorant", sans: "jost", script: "parisienne" },
    { id: "playfair-montserrat", label: "Playfair + Montserrat", display: "playfair", sans: "montserrat", script: "greatVibes" },
  ],

  headers: [
    { id: "bar", label: "Bar" },
    { id: "transparent", label: "Transparent until scroll" },
    { id: "centered", label: "Centred monogram" },
    { id: "minimal", label: "Minimal (menu button)" },
  ],

  layouts: [
    { id: "editorial", label: "Editorial (diagonal)" },
    { id: "centered", label: "Centred" },
    { id: "split", label: "Split (needs a hero photo)" },
  ],
} satisfies ThemeConfig;
