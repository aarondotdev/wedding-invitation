## ADDED Requirements

### Requirement: Email one-time-code login
The system SHALL let an allowlisted admin sign in at `/admin/login` by entering their email, receiving a one-time code by email, and entering that code.

#### Scenario: Allowlisted admin signs in
- **WHEN** an admin whose email is in `ADMIN_EMAILS` requests a code and enters the correct code
- **THEN** a session is created and they are redirected to `/admin/guests`

#### Scenario: Wrong or expired code
- **WHEN** an incorrect or expired code is entered
- **THEN** an error is shown and no session is created

#### Scenario: Non-allowlisted email
- **WHEN** someone requests a code for an email not in `ADMIN_EMAILS`
- **THEN** the page shows the same "if this email is allowed, we've sent a code" message as for allowed emails
- **AND** no email is sent and no account is created

### Requirement: Email link sign-in
The system SHALL accept the sign-in link from the email at `/auth/confirm` and create a session when the link is valid.

#### Scenario: Valid link
- **WHEN** an allowlisted admin opens a valid, unexpired sign-in link
- **THEN** they are signed in and redirected to `/admin/guests`

#### Scenario: Invalid link
- **WHEN** the link is invalid or expired
- **THEN** they are redirected to `/admin/login` with an error message

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
