## ADDED Requirements

### Requirement: Editorial invitation layout
The invitation page SHALL present, in order: a hero with the couple's names and portrait, an "Our story" section, the countdown, the celebration events, a statement, the schedule, and the RSVP section, styled with the dark warm palette, display serif headings and numbered section labels.

#### Scenario: Guest opens their link
- **WHEN** a guest opens a valid invitation link
- **THEN** they see their personal greeting and the couple's names in large serif type over the portrait
- **AND** the remaining sections follow with numbered labels, e.g. "01 — Our story"

#### Scenario: Optional photos missing
- **WHEN** no story, statement or event photos are uploaded
- **THEN** those sections render as text-only without empty boxes

### Requirement: GSAP scroll animation
The page SHALL animate headings (line reveals), photos (unmask and parallax), the statement (word-by-word fill on scroll) and decorative lines (drawing), and SHALL use smooth scrolling on desktop pointers only.

#### Scenario: Scrolling to a section
- **WHEN** a section heading scrolls into view
- **THEN** its lines slide up into place

#### Scenario: Anchor navigation
- **WHEN** the guest clicks "RSVP" in the hero or navigation
- **THEN** the page scrolls smoothly to the RSVP section

### Requirement: Accessible and resilient motion
Animations SHALL be skipped when the visitor prefers reduced motion, and all content SHALL become visible even if JavaScript or GSAP fails to load.

#### Scenario: Reduced motion
- **WHEN** the device has "reduce motion" enabled
- **THEN** all content is visible immediately with no movement or smooth scrolling

#### Scenario: Script failure
- **WHEN** the animation script fails to run
- **THEN** all content becomes visible within 3 seconds

### Requirement: New content is CMS-editable
Navigation labels, section labels, the story title and text, the statement text, and all photos (hero, story, statement, per event) SHALL be editable in the CMS, with defaults.

#### Scenario: Replace the hero photo
- **WHEN** the editor uploads a hero photo in "Page text" → Photos and saves
- **THEN** the invitation hero shows the new photo on the next page load
