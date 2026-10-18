## ADDED Requirements

### Requirement: All visible text is editable in the CMS
Every piece of text a visitor can see on the invitation, RSVP form, home page, invalid-link page and countdown SHALL come from the Payload "Page text" global.

#### Scenario: Editing a heading
- **WHEN** the editor changes "Kindly Reply" to "Please RSVP" in `/cms` and saves
- **THEN** the invitation shows "Please RSVP" on the next page load, without a redeploy

#### Scenario: Message with the guest's name
- **WHEN** the greeting is set to "Hello {name}!"
- **THEN** a guest named "Maria & Jose" sees "Hello Maria & Jose!"

#### Scenario: Guest-facing errors
- **WHEN** a guest submits an RSVP after the deadline
- **THEN** the error message shown is the one configured in the CMS

### Requirement: The site works with an empty CMS
Every CMS field SHALL have a default, used both to prefill the form and when the global has never been saved or the field is empty.

#### Scenario: Fresh database
- **WHEN** the "Page text" and "Sharing & SEO" globals have never been saved
- **THEN** the site renders the default wording and the bundled preview image

### Requirement: Link preview is editable
The browser title, meta description, link-preview title and description, share image and its alt text SHALL be editable in the "Sharing & SEO" global. Empty text fields SHALL fall back to automatic wording built from the couple's names and date.

#### Scenario: Custom share image
- **WHEN** the editor uploads a new share image with alt text and saves
- **THEN** the page's `og:image` and `twitter:image` point to the uploaded image, with that alt text

#### Scenario: Automatic description
- **WHEN** the description field is empty and the wedding date changes
- **THEN** the meta description shows the new date

### Requirement: Uploaded images persist in production
Uploaded images SHALL be stored in Vercel Blob so they survive redeploys.

#### Scenario: Upload then redeploy
- **WHEN** an image is uploaded in `/cms` and the site is redeployed
- **THEN** the image is still available at its URL
