import localFont from "next/font/local";

// Every font a preset can use, declared once and self-hosted (Latin subset, files in ./fonts, all
// SIL Open Font License from Google Fonts). Self-hosting avoids downloading from Google at dev and
// build time, which often timed out. Only the default pairing (Bodoni Moda, Inria Serif, Great Vibes)
// and the fonts the guest page sets directly (Oswald, Eyesome, New Icon) are preloaded; the others
// download only when a page actually uses them. Keep every file .woff2 (about a third of .ttf/.otf).
//
// To add a font: put its .woff2 in ./fonts, declare it here with a unique `--ff-*` variable, add it
// to `families`, then reference its key from a pairing in config.ts.
const bodoniModa = localFont({
  src: "./fonts/bodoni-moda.woff2",
  weight: "400 900",
  variable: "--ff-bodoni-moda",
  adjustFontFallback: "Times New Roman",
});
// Outfit is only the guest admin/CMS font (:root), so guest pages don't preload it
const outfit = localFont({ src: "./fonts/outfit.woff2", weight: "100 900", variable: "--ff-outfit", preload: false });
const oswald = localFont({ src: "./fonts/oswald.woff2", weight: "200 700", variable: "--ff-oswald" });
// Inria Serif (SIL OFL): six static faces, no variable font
const inriaSerif = localFont({
  src: [
    { path: "./fonts/inria-serif/InriaSerif-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/inria-serif/InriaSerif-LightItalic.woff2", weight: "300", style: "italic" },
    { path: "./fonts/inria-serif/InriaSerif-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inria-serif/InriaSerif-Italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/inria-serif/InriaSerif-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/inria-serif/InriaSerif-BoldItalic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--ff-inria-serif",
  adjustFontFallback: "Times New Roman",
});
const rusticRoadway = localFont({ src: "./fonts/rustic-roadway.woff2", weight: "400", variable: "--ff-rustic-roadway", preload: false });
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
const amsterdamHandwriting = localFont({
  src: "./fonts/amsterdam-handwriting.woff2",
  weight: "400",
  variable: "--ff-amsterdam",
  adjustFontFallback: false,
  preload: false,
});
const eyesomeScript = localFont({
  src: "./fonts/eyesome-script.woff2",
  weight: "400",
  variable: "--ff-eyesome",
  adjustFontFallback: false,
});
const newIconScript = localFont({
  src: "./fonts/new-icon-script.woff2",
  weight: "400",
  variable: "--ff-new-icon",
  adjustFontFallback: false,
});

export const families = {
  bodoniModa: { font: bodoniModa, cssVar: "--ff-bodoni-moda" },
  outfit: { font: outfit, cssVar: "--ff-outfit" },
  oswald: { font: oswald, cssVar: "--ff-oswald" },
  inriaSerif: { font: inriaSerif, cssVar: "--ff-inria-serif" },
  rusticRoadway: { font: rusticRoadway, cssVar: "--ff-rustic-roadway" },
  greatVibes: { font: greatVibes, cssVar: "--ff-great-vibes" },
  cormorant: { font: cormorant, cssVar: "--ff-cormorant" },
  jost: { font: jost, cssVar: "--ff-jost" },
  playfair: { font: playfair, cssVar: "--ff-playfair" },
  montserrat: { font: montserrat, cssVar: "--ff-montserrat" },
  parisienne: { font: parisienne, cssVar: "--ff-parisienne" },
  amsterdamHandwriting: { font: amsterdamHandwriting, cssVar: "--ff-amsterdam" },
  eyesomeScript: { font: eyesomeScript, cssVar: "--ff-eyesome" },
  newIconScript: { font: newIconScript, cssVar: "--ff-new-icon" },
} as const;

export type FontKey = keyof typeof families;

// Class names that define every --ff-* variable; put them on <html>
export const fontVariableClasses = Object.values(families)
  .map((f) => f.font.variable)
  .join(" ");
