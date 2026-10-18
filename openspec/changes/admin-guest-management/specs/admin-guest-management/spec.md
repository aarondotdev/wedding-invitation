## ADDED Requirements

### Requirement: Guest overview
`/admin/guests` SHALL list all guests with name, party size, contact details, RSVP status, number attending, whether the link has been opened, and whether the link is revoked. It SHALL show a summary of guests invited, seats offered, confirmed attendees, declined, and awaiting reply.

#### Scenario: Viewing the list
- **WHEN** an admin opens `/admin/guests`
- **THEN** every guest is listed with those fields, sorted by name
- **AND** the summary totals match the rows (attending seats = sum of guest_count for guests who accepted)

### Requirement: Add a guest manually
The admin SHALL be able to add a guest with name, party size (1–20), and optional phone, email and notes. The new guest's personal link SHALL be shown immediately.

#### Scenario: Valid guest
- **WHEN** the admin submits a name and a party size of 2
- **THEN** the guest is created with a generated code and their full link is displayed, ready to copy

#### Scenario: Invalid input
- **WHEN** the name is empty or the party size is outside 1–20
- **THEN** an error is shown and nothing is saved

#### Scenario: Duplicate name
- **WHEN** a guest with the same name (case-insensitive) already exists
- **THEN** the admin is warned and the guest is not created

### Requirement: Share a guest's link
For each active guest, the admin SHALL be able to copy the personal link and download a QR code PNG of it.

#### Scenario: Copy link
- **WHEN** the admin clicks "Copy link"
- **THEN** the full URL `<site>/i/<code>` is copied to the clipboard and a confirmation is shown

#### Scenario: QR code
- **WHEN** the admin clicks "QR"
- **THEN** a PNG QR code encoding the guest's link is downloaded

### Requirement: Edit a guest
The admin SHALL be able to change a guest's name, party size, phone, email and notes. The party size SHALL NOT be reduced below the guest's confirmed guest count.

#### Scenario: Edit
- **WHEN** the admin changes a guest's party size from 2 to 3
- **THEN** the change is saved and the guest's RSVP form offers up to 3

#### Scenario: Reduce below confirmed count
- **WHEN** the admin sets the party size to 1 for a guest who RSVP'd for 2
- **THEN** an error is shown and nothing is saved

### Requirement: Manage link access
The admin SHALL be able to revoke, restore and reissue a guest's link, and delete a guest. Reissue and delete SHALL require confirmation.

#### Scenario: Revoke and restore
- **WHEN** the admin revokes a guest's link
- **THEN** that link shows the invalid-link page and the row is marked revoked
- **AND** restoring it makes the same link work again

#### Scenario: Reissue
- **WHEN** the admin confirms "New link" for a guest
- **THEN** the guest gets a new code, the old link stops working, and their RSVP is kept

#### Scenario: Delete
- **WHEN** the admin confirms deleting a guest
- **THEN** the guest and their RSVP are permanently removed

### Requirement: Export links
The admin SHALL be able to download a CSV of all active guests' names, contact details, party sizes and links.

#### Scenario: Export
- **WHEN** the admin clicks "Export links"
- **THEN** a `links.csv` file downloads containing one row per non-revoked guest with their full URL
