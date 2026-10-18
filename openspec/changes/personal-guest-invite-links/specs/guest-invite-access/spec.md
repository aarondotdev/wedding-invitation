## ADDED Requirements

### Requirement: Personal invitation link
The system SHALL serve the invitation at `/i/<code>`, where `<code>` is a guest's unique invite code, and SHALL render it only when the code matches a guest that is not revoked.

#### Scenario: Valid code
- **WHEN** a visitor opens `/i/<code>` for an existing, non-revoked guest
- **THEN** the full invitation is shown, including events, schedule and RSVP form
- **AND** the greeting addresses the guest by their stored name

#### Scenario: Unknown code
- **WHEN** a visitor opens `/i/<code>` with a code that matches no guest
- **THEN** a polite "this invitation link isn't valid" page is shown with a `noindex` robots directive
- **AND** no venue, date, schedule or guest information is shown

#### Scenario: Revoked code
- **WHEN** a visitor opens `/i/<code>` for a guest whose code has been revoked
- **THEN** the same invalid-link page is shown as for an unknown code

### Requirement: Invite codes are unguessable
Each guest SHALL have a unique invite code of at least 12 URL-safe characters generated from a cryptographically secure random source.

#### Scenario: Code assigned on creation
- **WHEN** a guest row is created without an explicit code
- **THEN** the database assigns a unique 12-character URL-safe random code

### Requirement: Root page does not reveal the invitation
The root route `/` SHALL NOT display event venues, addresses, schedule or the RSVP form.

#### Scenario: Visiting the root URL
- **WHEN** a visitor opens `/`
- **THEN** they see the couple's names and a message to use their personal invitation link
- **AND** no venue, address, schedule or RSVP form is present in the response

### Requirement: Guest data is server-only
Guest records SHALL NOT be readable or writable from the browser through the Supabase API. All access SHALL happen server-side with a secret key that is never sent to the client.

#### Scenario: Anonymous API access
- **WHEN** a client queries the `guests` table using the project's publishable/anon key
- **THEN** no rows are returned and no writes succeed

#### Scenario: Client bundle
- **WHEN** the production build is inspected
- **THEN** the Supabase secret key does not appear in any client JavaScript

### Requirement: Track first open
The system SHALL record the timestamp at which a guest's link is first successfully opened.

#### Scenario: First visit
- **WHEN** a guest opens their valid link and `opened_at` is empty
- **THEN** `opened_at` is set to the current time

#### Scenario: Repeat visit
- **WHEN** a guest opens their valid link and `opened_at` is already set
- **THEN** `opened_at` is unchanged

### Requirement: Invitation links are not indexed or leaked via referrer
Personal invitation pages SHALL instruct search engines not to index them and SHALL send no referrer to outbound links.

#### Scenario: Robots and referrer
- **WHEN** a response for `/i/<code>` is served
- **THEN** it includes a `noindex, nofollow` robots directive
- **AND** a `Referrer-Policy: no-referrer` header
