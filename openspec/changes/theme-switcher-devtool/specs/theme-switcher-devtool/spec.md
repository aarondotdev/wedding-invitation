## ADDED Requirements

### Requirement: Development-only panel
A theme switcher panel SHALL appear in the bottom-right corner of guest pages when running `npm run dev`, and SHALL NOT be rendered or shipped in production builds.

#### Scenario: Local development
- **WHEN** a developer opens a guest page on the dev server
- **THEN** a collapsed theme switcher appears at the bottom right, clear of the Next.js dev indicator and React Grab

#### Scenario: Production build
- **WHEN** the site is built for production
- **THEN** the page contains no switcher markup, and the client JavaScript contains no switcher code

### Requirement: Live switching of four dimensions
The expanded panel SHALL offer a choice of theme, fonts, header and layout, each listing the presets from the config. Choosing an option SHALL apply it immediately, without a reload.

#### Scenario: Switch theme
- **WHEN** the developer picks the dark burgundy theme
- **THEN** the page's colours change at once to that palette

#### Scenario: Animations stay correct after switching
- **WHEN** the developer switches fonts or layout
- **THEN** scroll animations recalculate their positions, and headings re-split for the new font

### Requirement: Choice persists per browser and can be reset
The current choice SHALL be saved in that browser and restored on reload without a visible flash. A **Reset** action SHALL return every dimension to the config defaults.

#### Scenario: Reload keeps the preview
- **WHEN** the developer reloads the page after choosing a theme
- **THEN** the same theme is applied before the page is shown

#### Scenario: Removed preset
- **WHEN** a saved choice refers to a preset id that no longer exists in the config
- **THEN** that dimension falls back to its default

#### Scenario: Reset
- **WHEN** the developer clicks **Reset**
- **THEN** all four dimensions return to the defaults, and the saved choice is cleared

### Requirement: Accessible panel
The panel SHALL be operable by keyboard, with labelled controls.

#### Scenario: Keyboard use
- **WHEN** the developer tabs to the panel toggle and presses Enter
- **THEN** the panel opens, its selects can be changed with the keyboard, and Escape closes it
