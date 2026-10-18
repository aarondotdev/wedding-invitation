import { expireTags } from "@/lib/revalidate";
import type { Field, GlobalConfig } from "payload";
import { PAGE_TEXT_CACHE_TAG, pageTextDefaults, storyChapterDefaults } from "@/lib/site-content-defaults";

type Section = keyof typeof pageTextDefaults;

// A text field prefilled with its default, labelled for a non-technical editor.
function text<S extends Section>(
  section: S,
  name: keyof (typeof pageTextDefaults)[S] & string,
  label: string,
  description: string,
  long = false,
): Field {
  const base = {
    name,
    label,
    defaultValue: pageTextDefaults[section][name] as string,
    admin: { description },
  };
  return long ? { ...base, type: "textarea" } : { ...base, type: "text" };
}

// Optional photo picked from (or uploaded to) Images
function photo(description: string, name = "photo", label = "Photo"): Field {
  return { name, label, type: "upload", relationTo: "media", admin: { description } };
}

export const PageText: GlobalConfig = {
  slug: "pageText",
  label: "Page text",
  admin: {
    description:
      "All the wording on the invitation. Words in {curly brackets} are filled in automatically — keep them as they are.",
  },
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        expireTags(PAGE_TEXT_CACHE_TAG);
      },
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "hero",
          label: "Top of the invitation",
          fields: [
            text("hero", "greeting", "Greeting", "First line guests see. {name} becomes the guest's name, e.g. \"Dear Maria & Jose,\"."),
            text("hero", "intro", "Line above the names", "Small capitals above the couple's names."),
            text("hero", "ampersand", "Between the names", "Shown between the two names, e.g. \"&\" or \"and\"."),
            text("hero", "invitationLine", "Line below the names", "e.g. \"request the pleasure of your company\"."),
            text("hero", "rsvpButton", "RSVP button", "Button that jumps down to the reply form."),
            photo("Optional large portrait behind the names. A tall photo works best. Leave empty to show just the names. Shown in black and white."),
          ],
        },
        {
          name: "nav",
          label: "Menu",
          description: "Links at the top of the page. They also label each section, e.g. \"01 — Our story\".",
          fields: [
            {
              type: "row",
              fields: [
                text("nav", "story", "Our story", "Link to the story section."),
                text("nav", "celebration", "Celebration", "Link to the ceremony and reception."),
                text("nav", "entourage", "Entourage", "Link to the family and entourage."),
                text("nav", "details", "Details", "Link to the dress code."),
              ],
            },
            {
              type: "row",
              fields: [
                text("nav", "schedule", "Schedule", "Link to the order of the day."),
                text("nav", "gallery", "Gallery", "Label of the photo gallery."),
                text("nav", "faq", "FAQ", "Link to the questions and answers."),
                text("nav", "rsvp", "RSVP", "Link to the reply form."),
              ],
            },
            {
              type: "row",
              fields: [
                text("nav", "menu", "Menu button", "Read aloud for the menu button (shown with some header styles)."),
                text("nav", "close", "Close button", "Read aloud for the button that closes the menu."),
              ],
            },
          ],
        },
        {
          name: "story",
          label: "Our story",
          fields: [
            text("story", "title", "Heading", "Large heading of the story section."),
            text("story", "text", "Story", "A few sentences about the two of you.", true),
            photo("Optional photo next to the story. Leave empty for text only. Shown in black and white."),
            {
              name: "chapters",
              type: "array",
              label: "Chapters",
              labels: { singular: "Chapter", plural: "Chapters" },
              defaultValue: storyChapterDefaults,
              admin: {
                description:
                  "Numbered rows under the story, each with a large photo that alternates left and right (01, 02, 03…). Leave empty to hide them.",
              },
              fields: [
                { name: "title", type: "text", required: true, label: "Title", admin: { description: "e.g. \"How we met\"" } },
                { name: "text", type: "textarea", label: "Text" },
                { name: "photo", type: "upload", relationTo: "media", label: "Photo", admin: { description: "A tall (portrait) photo works best." } },
              ],
            },
          ],
        },
        {
          name: "statement",
          label: "Big statement",
          fields: [
            text("statement", "text", "Statement", "One sentence shown in very large letters that light up as guests scroll. Keep it short (about 6–10 words).", true),
            text("statement", "note", "Small note", "Short paragraph beside the statement.", true),
            photo("Full-width wide photo shown just above the statement. A landscape photo works best. Leave empty to hide it.", "bandPhoto", "Wide photo above"),
            photo("Optional small photo beside the statement. Shown in black and white."),
            photo("Optional large landscape photo below the statement, on the right.", "secondaryPhoto", "Large photo below"),
          ],
        },
        {
          name: "sections",
          label: "Section headings",
          fields: [
            text("sections", "countdownTitle", "Countdown heading", "Heading above the countdown timer."),
            text("sections", "eventsTitle", "Events heading", "Heading above the ceremony and reception cards."),
            text("sections", "viewMap", "Map link", "Link under each venue that opens the map."),
            text("sections", "dressCodeLabel", "Dress code label", "Shown before the dress code, e.g. \"Dress code:\"."),
            text("sections", "scheduleTitle", "Schedule heading", "Heading above the order of the day."),
            text("sections", "rsvpTitle", "Reply heading", "Heading above the RSVP form."),
            text("sections", "respondBy", "Reply deadline line", "{date} becomes the \"RSVP by\" date from Wedding details."),
          ],
        },
        {
          name: "countdown",
          label: "Countdown",
          fields: [
            {
              type: "row",
              fields: [
                text("countdown", "days", "Days", "Label under the days."),
                text("countdown", "hours", "Hours", "Label under the hours."),
                text("countdown", "minutes", "Minutes", "Label under the minutes."),
                text("countdown", "seconds", "Seconds", "Label under the seconds."),
              ],
            },
          ],
        },
        {
          name: "rsvpForm",
          label: "Reply form",
          fields: [
            {
              type: "row",
              fields: [
                text("rsvpForm", "accept", "\"Yes\" option", "Choice for guests who are coming."),
                text("rsvpForm", "decline", "\"No\" option", "Choice for guests who can't come."),
              ],
            },
            {
              type: "row",
              fields: [
                text("rsvpForm", "acceptNote", "\"Yes\" card line", "Small line under the \"yes\" option."),
                text("rsvpForm", "declineNote", "\"No\" card line", "Small line under the \"no\" option."),
              ],
            },
            {
              type: "row",
              fields: [
                text("rsvpForm", "guestSingular", "One guest", "Word after 1, e.g. \"1 guest\"."),
                text("rsvpForm", "guestPlural", "Several guests", "Word after 2 or more, e.g. \"3 guests\"."),
              ],
            },
            text("rsvpForm", "guestCountLabel", "Guest count (screen readers)", "Read aloud for the number-of-guests menu."),
            text("rsvpForm", "messagePlaceholder", "Message box hint", "Grey hint inside the message box."),
            {
              type: "row",
              fields: [
                text("rsvpForm", "sendButton", "Send button", "Button for a first reply."),
                text("rsvpForm", "updateButton", "Update button", "Button when changing an earlier reply."),
                text("rsvpForm", "sendingButton", "While sending", "Button text while the reply is saving."),
              ],
            },
          ],
        },
        {
          name: "rsvpMessages",
          label: "Reply messages",
          fields: [
            text("rsvpMessages", "alreadyReplied", "Already replied", "Above the form when the guest has replied before.", true),
            text("rsvpMessages", "thanksAttending", "Thank you (coming)", "After a guest says yes. {name} becomes their name.", true),
            text("rsvpMessages", "thanksDeclined", "Thank you (not coming)", "After a guest says no. {name} becomes their name.", true),
            text("rsvpMessages", "closed", "Replies closed", "Shown instead of the form after the RSVP deadline.", true),
            text("rsvpMessages", "noResponse", "No reply on record", "After the deadline, for guests who never replied.", true),
            text("rsvpMessages", "recordedAttending", "Reply on record (coming)", "After the deadline. {count} becomes e.g. \"2 guests\".", true),
            text("rsvpMessages", "recordedDeclined", "Reply on record (not coming)", "After the deadline, for guests who said no.", true),
            {
              type: "collapsible",
              label: "Error messages",
              admin: { initCollapsed: true },
              fields: [
                text("rsvpMessages", "errorClosed", "Sent after the deadline", "If a reply arrives after the RSVP deadline."),
                text("rsvpMessages", "errorInvalidLink", "Link no longer valid", "If the guest's link was replaced or switched off."),
                text("rsvpMessages", "errorChooseAttendance", "Nothing chosen", "If the guest didn't pick yes or no."),
                text("rsvpMessages", "errorGuestCount", "Too many guests", "{max} becomes the guest's limit, e.g. \"2 guests\"."),
                text("rsvpMessages", "errorGeneric", "Something went wrong", "If the reply couldn't be saved."),
              ],
            },
          ],
        },
        {
          name: "pages",
          label: "Other pages",
          fields: [
            text("pages", "homeMessage", "Home page message", "Shown at the main address to visitors without a personal link.", true),
            text("pages", "invalidLinkTitle", "Invalid link heading", "Heading when someone opens a wrong or switched-off link."),
            text("pages", "invalidLinkMessage", "Invalid link message", "Explains what to do with a wrong or switched-off link.", true),
          ],
        },
      ],
    },
  ],
};
