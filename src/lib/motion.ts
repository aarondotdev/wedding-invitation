// The owner chose to play the invitation's animations even when the device asks for reduced motion
// (e.g. iOS Settings → Accessibility → Motion → Reduce Motion). Set this to true to respect that
// setting again: every animation then stops for those visitors and a still version is shown.
// (The gallery marquee's still version lives in globals.css; see the note there.)
export const RESPECT_REDUCED_MOTION = false;

// True when animations should be skipped for this visitor
export function prefersReducedMotion() {
  return RESPECT_REDUCED_MOTION && typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Media query for "animations allowed", for gsap.matchMedia() conditions
export const MOTION_OK_QUERY = RESPECT_REDUCED_MOTION ? "(prefers-reduced-motion: no-preference)" : "all";
