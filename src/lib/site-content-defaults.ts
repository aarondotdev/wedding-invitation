// Starting values for the "Page text" and "Sharing & SEO" globals in the CMS (/cms).
// Edit the wording there; these prefill the form and are used until a field has been saved.
export const pageTextDefaults = {
  nav: {
    story: "Our story",
    celebration: "Celebration",
    entourage: "Entourage",
    details: "Details",
    schedule: "Schedule",
    gallery: "Gallery",
    wishes: "Wishes",
    faq: "FAQ",
    rsvp: "RSVP",
    menu: "Menu",
    close: "Close",
  },
  hero: {
    greeting: "Dear {name},",
    intro: "our very special guest",
    ampersand: "&",
    invitationLine: "request the pleasure of your company",
    rsvpButton: "RSVP",
  },
  story: {
    title: "Two hearts under one moon",
    text: "You didn't receive this invitation by chance. On this special day, we truly hope you'll be with us.",
  },
  statement: {
    text: "We would be honoured to celebrate this day with you",
    note: "Your presence is the greatest gift. Come as you are, and leave with memories we will share forever.",
  },
  sections: {
    countdownTitle: "Counting down",
    eventsTitle: "The Celebration",
    viewMap: "View map",
    dressCodeLabel: "Dress code:",
    scheduleTitle: "Wedding Timeline",
    rsvpTitle: "Kindly Reply",
    respondBy: "Please respond by {date}",
  },
  countdown: {
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
  },
  rsvpForm: {
    accept: "Joyfully accepts",
    acceptNote: "We'll be there to celebrate",
    decline: "Regretfully decline",
    declineNote: "Sending our love from afar",
    guestSingular: "guest",
    guestPlural: "guests",
    guestCountLabel: "Number of guests attending",
    messagePlaceholder: "Dietary needs or a note for the couple",
    sendButton: "Send RSVP",
    updateButton: "Update RSVP",
    sendingButton: "Sending…",
  },
  rsvpMessages: {
    alreadyReplied: "You've already replied. Feel free to update your response below.",
    thanksAttending: "Thank you, {name}! We can't wait to celebrate with you.",
    thanksDeclined: "Thank you for letting us know, {name}. You'll be missed!",
    closed: "RSVPs have closed. For any changes, please contact the couple directly.",
    noResponse: "We haven't received your response.",
    recordedAttending: "You're coming with {count} in total. We can't wait!",
    recordedDeclined: "You let us know you can't make it. You'll be missed!",
    errorClosed: "RSVPs have closed. Please contact the couple directly.",
    errorInvalidLink: "This invitation link is no longer valid.",
    errorChooseAttendance: "Please let us know whether you can attend.",
    errorGuestCount: "Please choose between 1 and {max}.",
    errorGeneric: "Something went wrong saving your RSVP. Please try again.",
  },
  customSection: {
    title: "",
    body: "",
  },
  wishes: {
    title: "Well Wishes",
    intro: "Leave a message for the couple. Everyone who opens their invitation can read it.",
    placeholder: "Write your congratulations here…",
    sendButton: "Post message",
    updateButton: "Update message",
    sendingButton: "Posting…",
    thanks: "Thank you, {name}! Your message is up.",
    alreadyPosted: "You've left a message. You can change it below.",
    empty: "Be the first to leave a message.",
    errorEmpty: "Please write a message first.",
    errorInvalidLink: "This invitation link is no longer valid.",
    errorGeneric: "Something went wrong saving your message. Please try again.",
  },
  pages: {
    homeMessage:
      "This celebration is by invitation. Please open the personal link we sent you to view your invitation.",
    invalidLinkTitle: "Oh dear",
    invalidLinkMessage:
      "This invitation link isn't valid. Please check the link you received, or reach out to the couple for a new one.",
  },
};

export type PageText = typeof pageTextDefaults;

// focalX/focalY: the point to keep in view when the photo is cropped, in % from the left/top
// (set with the focal-point picker in /cms; 50/50 is the centre)
export type SitePhoto = { url: string; width: number; height: number; alt: string; focalX: number; focalY: number };

// CSS object-position for a photo, so cropping keeps its focal point (e.g. the couple's faces) in view
export const focalPosition = (photo: Pick<SitePhoto, "focalX" | "focalY">) => `${photo.focalX}% ${photo.focalY}%`;

// Photos chosen in "Page text". Each is optional and its block is hidden when empty.
export type PagePhotos = {
  hero: SitePhoto | null;
  story: SitePhoto | null;
  statement: SitePhoto | null;
  statementBand: SitePhoto | null;
  statementSecondary: SitePhoto | null;
};

// Numbered story rows are optional and start empty until added in the CMS.
export const storyChapterDefaults: Array<{ title: string; text: string }> = [];

export type StoryChapter = { title: string; text: string; photo: SitePhoto | null };


// Empty strings mean "use the automatic wording" (built from the names and date in getSeo()).
export const seoDefaults = {
  title: "",
  description: "",
  shareTitle: "",
  shareDescription: "",
  shareImageAlt: "Lorenz and Jenzell under a glowing crescent moon",
};

// Bundled banner used until a share image is uploaded in the CMS
export const DEFAULT_SHARE_IMAGE = { url: "/og-default.jpg", width: 1200, height: 630 };

export const PAGE_TEXT_CACHE_TAG = "page-text";
export const SEO_CACHE_TAG = "seo";

// Replaces {placeholders} with values. Unknown placeholders are left as typed so mistakes are visible.
export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
