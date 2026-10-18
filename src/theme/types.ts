import type { FontKey } from "./fonts";

export type ThemeColors = {
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  /** Brighter gold for lines and decoration */
  accent: string;
  /** Gold that is readable as text and on buttons against `background` */
  accentInk: string;
  line: string;
  /** Hero glow: inner (gold) and outer tint */
  glowInner: string;
  glowOuter: string;
};

export type ThemePreset = { id: string; label: string; colors: ThemeColors };
export type FontPairing = { id: string; label: string; display: FontKey; sans: FontKey; script: FontKey };
export type HeaderVariant = { id: "bar" | "transparent" | "centered" | "minimal"; label: string };
export type LayoutVariant = { id: "editorial" | "centered" | "split"; label: string };

export type ThemeSelection = { theme: string; font: string; header: string; layout: string };

export type ThemeConfig = {
  defaults: ThemeSelection;
  themes: ThemePreset[];
  fonts: FontPairing[];
  headers: HeaderVariant[];
  layouts: LayoutVariant[];
};
