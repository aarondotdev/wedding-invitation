import type { SitePhoto } from "@/lib/site-content-defaults";

// Starting values for the "Family & entourage" and "Guest details" globals in the CMS (/cms).
// Names are placeholders: replace them in the CMS. These prefill the form and are shown until the
// global has been saved for the first time.

export type NameGroup = { title: string; names: string[] };

export const groomsmenNames = [
  "Ralph Russel Ballesteros",
  "Engr. John Angelo Garque",
  "Niño Jericho Bonsol",
  "Engr. Niño Tenorio",
  "Bryan Andal",
  "Jake Malabanan",
];

export const entourageDefaults = {
  title: "THE ENTOURAGE",
  intro: "With grateful hearts, we honor the people who guide us and stand beside us on our wedding day.",
  parents: [
    { title: "Parents of the Groom", names: ["Mr. Father of the Groom", "Mrs. Mother of the Groom"] },
    { title: "Parents of the Bride", names: ["Mr. Father of the Bride", "Mrs. Mother of the Bride"] },
  ] as NameGroup[],
  secondaryTitle: "Secondary Sponsors",
  littleOnesTitle: "The Little Ones",
  // Optional closing photo, chosen in the CMS
  photo: null as SitePhoto | null,
  sponsors: {
    title: "Principal Sponsors",
    names: [
      "Mr. Sponsor Name",
      "Mrs. Sponsor Name",
      "Mr. Sponsor Name",
      "Mrs. Sponsor Name",
      "Mr. Sponsor Name",
      "Mrs. Sponsor Name",
      "Mr. Sponsor Name",
      "Mrs. Sponsor Name",
    ],
  } as NameGroup,
  entourage: [
    { title: "Best Man", names: ["Mr. David Andrew Malabanan"] },
    { title: "Maid of Honor", names: ["Maid of Honor Name"] },
    { title: "Groomsmen", names: groomsmenNames },
    { title: "Bridesmaids", names: ["Bridesmaid Name", "Bridesmaid Name", "Bridesmaid Name"] },
    { title: "To clothe us as one (Veil)", names: ["Veil Sponsor Name", "Veil Sponsor Name"] },
    { title: "To bind us together (Cord)", names: ["Cord Sponsor Name", "Cord Sponsor Name"] },
    { title: "To light our path (Candle)", names: ["Candle Sponsor Name", "Candle Sponsor Name"] },
    { title: "Ring Bearer", names: ["Luis Caleb Alvarez"] },
    { title: "Bible Bearer", names: ["Christian Andaya"] },
    { title: "Coin Bearer", names: ["Ghian Kay Sarmiento"] },
    { title: "Flower Girls", names: ["Flower Girl Name", "Flower Girl Name"] },
  ] as NameGroup[],
};

export type Entourage = typeof entourageDefaults;

export const detailsDefaults = {
  dressCode: {
    title: "THE VENUES",
    description:
      "We kindly ask our guests to come in formal or semi-formal attire. Please avoid wearing white, which we're saving for the bride, and very bright neon colours.",
    note: "If you'd like to match our day, here are a few colours we love.",
    palette: [
      { name: "Champagne", color: "#E8D9C0" },
      { name: "Sage", color: "#A3B18A" },
      { name: "Dusty Rose", color: "#C9A0A0" },
      { name: "Taupe", color: "#8B7D6B" },
      { name: "Navy", color: "#2E3A55" },
    ],
  },
  faq: {
    title: "Questions & Answers",
    intro: "In case you're wondering",
    items: [
      {
        question: "Where are the ceremony and the reception?",
        answer: "The ceremony and reception venues, with addresses and map links, are listed under The Celebration above.",
      },
      {
        question: "Can I bring a plus one?",
        answer: "Our celebration is intimate, so we can only welcome the guests named on the invitation. Your reply form shows how many seats are reserved for you.",
      },
      {
        question: "Are children welcome?",
        answer: "We love your little ones, but apart from the children in our entourage, we kindly ask that this be an adults-only celebration.",
      },
      {
        question: "Can we take photos and post them online?",
        answer: "Yes, please do! We only ask that you keep phones away during the ceremony and give our photographers room to work.",
      },
      {
        question: "Is there a dress code?",
        answer: "Yes, formal or semi-formal. See the Dress Code section for colours we love.",
      },
      {
        question: "Who can I contact with other questions?",
        answer: "Message either of us directly and we'll be happy to help.",
      },
    ],
  },
  gallery: {
    title: "Gallery",
    intro: "A few of our favorite memories together.",
  },
};

export type Details = typeof detailsDefaults;

export type GalleryPhoto = SitePhoto;

export const ENTOURAGE_CACHE_TAG = "entourage";
export const DETAILS_CACHE_TAG = "details";
