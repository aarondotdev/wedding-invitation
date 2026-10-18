## ADDED Requirements

### Requirement: Import guest list from CSV
A command-line script SHALL import guests from a CSV file with columns `name`, `party_size` and optional `phone`, `email`, `notes`.

#### Scenario: Fresh import
- **WHEN** the couple runs the import command with a CSV of 50 guests
- **THEN** 50 guest rows are created, each with an auto-generated invite code
- **AND** the script reports how many rows were inserted

#### Scenario: Re-running the import
- **WHEN** the import is run again with a CSV containing names that already exist
- **THEN** existing guests are skipped (not duplicated) and their codes are unchanged

#### Scenario: Invalid row
- **WHEN** a row has an empty name or a party size outside 1–20
- **THEN** that row is skipped with a warning naming the line number, and valid rows are still imported

### Requirement: Export personal links and QR codes
The script SHALL export every non-revoked guest's personal link to a CSV and generate a QR code image for each link.

#### Scenario: Export
- **WHEN** the couple runs the export command
- **THEN** `links.csv` is written with name, phone, email, party size and full URL (`<site-url>/i/<code>`)
- **AND** one PNG QR code per guest is written, named after the guest
- **AND** the output folder is excluded from git

### Requirement: Revoke and reissue links
The script SHALL let the couple revoke a code, restore it, or reissue a new code for a guest while keeping their RSVP.

#### Scenario: Revoke
- **WHEN** the couple runs `revoke <code>`
- **THEN** the guest's `revoked_at` is set and the link shows the invalid-link page

#### Scenario: Reissue
- **WHEN** the couple runs `reissue <code>`
- **THEN** the guest gets a new random code, the old link becomes invalid, the RSVP is kept, and the new URL is printed
