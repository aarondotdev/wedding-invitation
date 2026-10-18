## ADDED Requirements

### Requirement: Presets are declared in one config file
Themes, font pairings, headers, layouts and the default selection SHALL be declared in `src/theme/config.ts`. Each preset SHALL have a unique `id` and a human-readable `label`.

#### Scenario: Add a theme
- **WHEN** a developer adds a theme entry with an id, a label and its colours to the config
- **THEN** it appears in the switcher's theme list and applies its colours when chosen, with no other code changes

#### Scenario: Add a font pairing
- **WHEN** a developer declares a new font family in `src/theme/fonts.ts` and adds a pairing that uses it to the config
- **THEN** the pairing appears in the switcher's font list and applies those families when chosen

### Requirement: Guest pages render the configured defaults
Guest pages (invitation, home and invalid-link pages) SHALL render the default theme, font pairing, header and layout from the config, server-side, for every visitor.

#### Scenario: Production render
- **WHEN** a guest opens their invitation on the live site
- **THEN** the page uses the default preset of every dimension
- **AND** looks the same as before this change, with white, burgundy and gold, the current fonts, the blurred bar header and the editorial hero

#### Scenario: Change the default
- **WHEN** a developer changes `defaults.theme` in the config and deploys
- **THEN** guest pages render the new theme

### Requirement: Theme changes do not affect the guest admin or CMS
Applying any preset SHALL NOT change the appearance of `/admin` pages or `/cms`.

#### Scenario: Different default theme
- **WHEN** the default theme is set to a palette with a different gold
- **THEN** the guest admin's buttons and focus rings keep their current colours

### Requirement: Non-default fonts are not downloaded by guests
Font families that the default pairing doesn't use SHALL NOT be preloaded or downloaded when rendering the default.

#### Scenario: Default page load
- **WHEN** a guest loads an invitation
- **THEN** only the default pairing's font files are requested

### Requirement: Header variants
The header SHALL support the variants `bar`, `transparent`, `centered` and `minimal`, keeping the monogram, section links and RSVP link reachable in each.

#### Scenario: Transparent header
- **WHEN** the `transparent` header is active and the visitor scrolls past the hero
- **THEN** the header gains its solid background, and loses it again when scrolling back to the top

#### Scenario: Minimal header menu
- **WHEN** the `minimal` header is active and the visitor opens the menu button
- **THEN** a full-screen navigation overlay shows the section links and RSVP
- **AND** pressing Escape or choosing a link closes it

### Requirement: Hero layout variants
The hero SHALL support the layouts `editorial`, `centered` and `split`. `split` SHALL fall back to `centered` when no hero photo is set.

#### Scenario: Split without photo
- **WHEN** the `split` layout is active and the hero has no photo
- **THEN** the hero renders as `centered`
