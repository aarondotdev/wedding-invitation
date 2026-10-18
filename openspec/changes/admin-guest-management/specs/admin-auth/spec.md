## ADDED Requirements

### Requirement: Email and password login
The system SHALL let an allowlisted admin sign in at `/admin/login` with their email and password.

#### Scenario: Allowlisted admin signs in
- **WHEN** an admin whose email is in `ADMIN_EMAILS` enters the correct password
- **THEN** a session is created and they are redirected to `/admin/guests`

#### Scenario: Wrong password
- **WHEN** an incorrect password is entered
- **THEN** "Incorrect email or password." is shown, no session is created, and the email stays filled in

#### Scenario: Non-allowlisted email
- **WHEN** someone signs in with an email not in `ADMIN_EMAILS`
- **THEN** they see the same "Incorrect email or password." message
- **AND** no request is made to Supabase Auth

### Requirement: Admin passwords are managed from the command line
Admin accounts and passwords SHALL be created and reset with `npm run admins`. New accounts get `ADMIN_DEFAULT_PASSWORD`, which is kept only in `.env.local`. Passwords SHALL be at least 12 characters.

#### Scenario: Create admins
- **WHEN** `npm run admins` runs with emails in `ADMIN_EMAILS`
- **THEN** each missing account is created with the default password and existing accounts are unchanged

#### Scenario: Reset a password
- **WHEN** `npm run admins -- set-password <email>` runs and the password is left empty
- **THEN** that admin's password is reset to `ADMIN_DEFAULT_PASSWORD`

#### Scenario: Non-admin email
- **WHEN** `set-password` is given an email not in `ADMIN_EMAILS`
- **THEN** it refuses and changes nothing

### Requirement: Admin surfaces require an authorized session
Every admin page, Server Action and route handler SHALL verify on the server that the request has a valid session whose email is in `ADMIN_EMAILS`.

#### Scenario: Signed-out visit
- **WHEN** a visitor without a session opens any `/admin` page other than the login page
- **THEN** they are redirected to `/admin/login`

#### Scenario: Signed-out direct request
- **WHEN** a request without a valid admin session calls an admin Server Action or the export/QR routes
- **THEN** the request is rejected and no guest data is returned or changed

#### Scenario: Removed admin
- **WHEN** a signed-in user's email is no longer in `ADMIN_EMAILS`
- **THEN** their next admin request signs them out and redirects to the login page

### Requirement: Sign out
The system SHALL let a signed-in admin sign out.

#### Scenario: Sign out
- **WHEN** the admin clicks "Sign out"
- **THEN** the session is cleared and they are redirected to `/admin/login`

### Requirement: Admin pages are private
Admin pages SHALL be excluded from search indexing and never cached.

#### Scenario: Robots
- **WHEN** any `/admin` page is served
- **THEN** it includes a `noindex, nofollow` robots directive
