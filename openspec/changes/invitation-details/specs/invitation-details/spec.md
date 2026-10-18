## ADDED Requirements

### Requirement: Family and entourage
The invitation SHALL show parents, principal sponsors and entourage groups from the "Family & entourage" global, and SHALL hide the section when all lists are empty.

#### Scenario: Editor adds a group
- **WHEN** the editor adds a group "Secondary Sponsors" with two names and saves
- **THEN** the group appears in the entourage grid with its heading and names

### Requirement: Dress code with palette
The invitation SHALL show the dress-code heading, description and colour swatches from "Guest details". Colours SHALL be validated as 6-digit hex codes.

#### Scenario: Invalid colour
- **WHEN** the editor enters "green" as a colour code
- **THEN** the CMS rejects it with "Use a 6-digit hex code, e.g. #A3B18A"

### Requirement: Questions and answers
Each FAQ item SHALL be a collapsible question that reveals its answer, working without JavaScript.

#### Scenario: Guest opens a question
- **WHEN** a guest taps a question
- **THEN** its answer is shown

### Requirement: Gallery
Gallery photos SHALL scroll sideways while the section is pinned on wide screens with motion allowed, and SHALL be a grid otherwise. Photos SHALL turn from black and white to colour as they come into view.

#### Scenario: Reduced motion
- **WHEN** reduced motion is on
- **THEN** the gallery is a static grid and every photo is visible

### Requirement: Story chapters with alternating photos
Story chapters SHALL render as numbered rows whose photos alternate left and right, falling back to full-width text when a chapter has no photo.

#### Scenario: Three chapters
- **WHEN** three chapters with photos are saved
- **THEN** they show as 01, 02, 03 with photos on the left, right, left

### Requirement: Scripts can write CMS content
CMS hooks SHALL NOT fail when Payload runs outside Next.js.

#### Scenario: Import script
- **WHEN** `payload run` uploads images and updates globals
- **THEN** the writes succeed, and cache expiry is skipped
