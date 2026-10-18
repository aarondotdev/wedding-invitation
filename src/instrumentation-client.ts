// Runs in the browser before the app becomes interactive.

// React Grab (https://www.react-grab.com/): hover any element and press Ctrl/⌘+C to copy its
// component name, file and source for pasting into a coding agent. Local development only — it must
// load before React starts, and `require` inside this check is removed from production builds.
if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("react-grab");
}
