import localFont from "next/font/local";

// Every font a preset can use, declared once and self-hosted (Latin subset, files in ./fonts, all
// SIL Open Font License from Google Fonts). Self-hosting avoids downloading from Google at dev and
// build time, which often timed out. Only the default pairing (Bodoni Moda, Outfit, Great Vibes)
// is preloaded; the others download only when a preview actually uses them.
//
// To add a font: put its .woff2 in ./fonts, declare it here with a unique `--ff-*` variable, add it
// to `families`, then reference its key from a pairing in config.ts.
const bodoniModa = localFont({
  src: "./fonts/bodoni-moda.woff2",
  weight: "400 900",
  variable: "--ff-bodoni-moda",
  adjustFontFallback: "Times New Roman",
});
const outfit = localFont({ src: "./fonts/outfit.woff2", weight: "100 900", variable: "--ff-outfit" });
const greatVibes = localFont({
  src: "./fonts/great-vibes.woff2",
  weight: "400",
  variable: "--ff-great-vibes",
  adjustFontFallback: "Times New Roman",
});
const cormorant = localFont({
  src: "./fonts/cormorant.woff2",
  weight: "300 500",
  variable: "--ff-cormorant",
  adjustFontFallback: "Times New Roman",
  preload: false,
});
const jost = localFont({ src: "./fonts/jost.woff2", weight: "100 900", variable: "--ff-jost", preload: false });
const playfair = localFont({
  src: "./fonts/playfair.woff2",
  weight: "400 900",
  variable: "--ff-playfair",
  adjustFontFallback: "Times New Roman",
  preload: false,
});
const montserrat = localFont({ src: "./fonts/montserrat.woff2", weight: "100 900", variable: "--ff-montserrat", preload: false });
const parisienne = localFont({
  src: "./fonts/parisienne.woff2",
  weight: "400",
  variable: "--ff-parisienne",
  adjustFontFallback: "Times New Roman",
  preload: false,
});

export const families = {
  bodoniModa: { font: bodoniModa, cssVar: "--ff-bodoni-moda" },
  outfit: { font: outfit, cssVar: "--ff-outfit" },
  greatVibes: { font: greatVibes, cssVar: "--ff-great-vibes" },
  cormorant: { font: cormorant, cssVar: "--ff-cormorant" },
  jost: { font: jost, cssVar: "--ff-jost" },
  playfair: { font: playfair, cssVar: "--ff-playfair" },
  montserrat: { font: montserrat, cssVar: "--ff-montserrat" },
  parisienne: { font: parisienne, cssVar: "--ff-parisienne" },
} as const;

export type FontKey = keyof typeof families;

// Class names that define every --ff-* variable; put them on <html>
export const fontVariableClasses = Object.values(families)
  .map((f) => f.font.variable)
  .join(" ");
