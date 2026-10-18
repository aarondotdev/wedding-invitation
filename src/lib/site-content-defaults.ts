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
    faq: "FAQ",
    rsvp: "RSVP",
  },
  hero: {
    greeting: "Dear {name},",
    intro: "Together with their families",
    ampersand: "&",
    invitationLine: "request the pleasure of your company",
    rsvpButton: "RSVP",
  },
  story: {
    title: "Two hearts under one moon",
    text: "Every love story is beautiful, but ours is our favourite. After years of laughter, adventures and quiet moments together, we're ready to begin our next chapter, and we would love for you to be there.",
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
    scheduleTitle: "Order of the Day",
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
    decline: "Regretfully declines",
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
  pages: {
    homeMessage:
      "This celebration is by invitation. Please open the personal link we sent you to view your invitation.",
    invalidLinkTitle: "Oh dear",
    invalidLinkMessage:
      "This invitation link isn't valid. Please check the link you received, or reach out to the couple for a new one.",
  },
};

export type PageText = typeof pageTextDefaults;

export type SitePhoto = { url: string; width: number; height: number; alt: string };

// Photos chosen in "Page text". Each is optional and its block is hidden when empty.
export type PagePhotos = {
  hero: SitePhoto | null;
  story: SitePhoto | null;
  statement: SitePhoto | null;
  statementBand: SitePhoto | null;
  statementSecondary: SitePhoto | null;
};

// Numbered story rows (placeholders; edit them in the CMS)
export const storyChapterDefaults = [
  { title: "How we met", text: "A few lines about where your story began. Edit this in the CMS." },
  { title: "Falling in love", text: "A few lines about the moments that brought you closer. Edit this in the CMS." },
  { title: "Forever starts here", text: "A few lines about the proposal and what comes next. Edit this in the CMS." },
];

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
