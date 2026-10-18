## ADDED Requirements

### Requirement: RSVP is saved to the guest's record
Submitting the RSVP form on a personal invitation page SHALL persist the response (attending, guest count, message, response time) on that guest's record, identified by invite code and re-validated on the server.

#### Scenario: Guest accepts
- **WHEN** a guest with a valid code submits "Joyfully accepts" with a guest count of 2 and party size 2
- **THEN** the record stores `attending = true`, `guest_count = 2`, the message, and `responded_at`
- **AND** the guest sees a thank-you confirmation using their name

#### Scenario: Guest declines
- **WHEN** a guest submits "Regretfully declines"
- **THEN** the record stores `attending = false` and `guest_count = 0`

#### Scenario: Code revoked between page load and submit
- **WHEN** the RSVP is submitted for a code that is now revoked or unknown
- **THEN** nothing is saved and an error message is shown

### Requirement: Guest count is capped at party size
The number of attendees in an RSVP SHALL be between 1 and the guest's `party_size` when attending, and this SHALL be enforced on the server and in the database.

#### Scenario: Form options
- **WHEN** a guest with party size 3 views the RSVP form
- **THEN** the guest-count selector offers only 1, 2 and 3

#### Scenario: Tampered request
- **WHEN** a request submits a guest count greater than the guest's party size
- **THEN** the RSVP is rejected with an error and nothing is saved

### Requirement: Name is not re-entered
The RSVP form SHALL NOT ask for the guest's name. It SHALL use the stored guest name.

#### Scenario: Form fields
- **WHEN** a guest views the RSVP form
- **THEN** it shows attendance, guest count (when party size > 1) and a message field, with no name field

### Requirement: Guests can update their RSVP before the deadline
The form SHALL prefill a previous response, and guests SHALL be able to change it until the RSVP deadline.

#### Scenario: Returning guest
- **WHEN** a guest who already responded opens their link before the deadline
- **THEN** the form is prefilled with their previous answers and can be resubmitted

#### Scenario: After the deadline
- **WHEN** a guest opens their link after the RSVP deadline
- **THEN** the form is replaced with their recorded response (if any) and a note to contact the couple for changes
- **AND** server-side submissions after the deadline are rejected
