## ADDED Requirements

### Requirement: Upload a guest list
The admin SHALL be able to upload an `.xlsx` or `.csv` file (up to 2 MB, up to 1000 rows) with columns `name`, `party_size`, and optional `phone`, `email`, `notes`. Header matching SHALL be case-insensitive and SHALL accept common aliases (e.g. "Party Size", "Seats", "Guest").

#### Scenario: Excel upload
- **WHEN** the admin uploads an `.xlsx` file whose first sheet has the expected headers
- **THEN** its rows are parsed and shown in a preview

#### Scenario: Unsupported or oversized file
- **WHEN** the file is not `.xlsx`/`.csv`, is over 2 MB, or has more than 1000 rows
- **THEN** an error explains the problem and nothing is parsed or saved

#### Scenario: Missing name column
- **WHEN** no column matches `name`
- **THEN** an error lists the expected headers and nothing is saved

### Requirement: Preview before importing
Before saving, the system SHALL show every row with a status of `ready`, `duplicate` (name already exists or repeats earlier in the file), or `invalid` (with a reason), plus counts for each.

#### Scenario: Mixed file
- **WHEN** a file contains 10 valid rows, 2 names already in the guest list, and 1 row with party size 50
- **THEN** the preview shows 10 ready, 2 duplicate, and 1 invalid with reason "party size must be 1–20"
- **AND** nothing has been saved yet

### Requirement: Import confirmed rows
When the admin confirms, the system SHALL insert only the `ready` rows after re-validating them on the server, and report how many were imported.

#### Scenario: Confirm import
- **WHEN** the admin clicks "Import 10 guests"
- **THEN** 10 guests are created with generated codes, the guest list refreshes, and a summary is shown

#### Scenario: Tampered rows
- **WHEN** the confirm request contains a row with an invalid party size or a name that now exists
- **THEN** that row is skipped and reported, and valid rows are still imported

### Requirement: Import template
The admin SHALL be able to download a template file with the expected headers and an example row.

#### Scenario: Template
- **WHEN** the admin clicks "Download template"
- **THEN** a CSV with headers `name,party_size,phone,email,notes` and one example row downloads
