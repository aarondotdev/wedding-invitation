// Starting values for the Wedding global in the CMS (/cms). Edit the details there; these are
// only used to prefill the form and until the global has been saved for the first time.
export const weddingDefaults = {
  partner1: "Lorenz",
  partner2: "Jenzell",
  // ISO string with timezone offset so the countdown is accurate everywhere
  date: "2027-06-12T16:00:00-07:00",
  displayDate: "Saturday, June 12, 2027",
  hashtag: "#ForeverStartsHere",
  rsvpBy: "May 1, 2027",
  // RSVPs are accepted until this moment (end of the rsvpBy day)
  rsvpDeadline: "2027-05-01T23:59:59-07:00",
  events: [
    {
      title: "Ceremony",
      time: "4:00 PM",
      venue: "St. Mary's Chapel",
      address: "123 Garden Lane, Napa, CA",
      mapUrl: "https://maps.google.com/?q=123+Garden+Lane+Napa+CA",
    },
    {
      title: "Reception",
      time: "6:00 PM",
      venue: "The Vineyard Estate",
      address: "456 Vine Road, Napa, CA",
      mapUrl: "https://maps.google.com/?q=456+Vine+Road+Napa+CA",
    },
  ],
  schedule: [
    { time: "3:30 PM", item: "Guest arrival" },
    { time: "4:00 PM", item: "Ceremony" },
    { time: "5:00 PM", item: "Cocktail hour" },
    { time: "6:00 PM", item: "Dinner & toasts" },
    { time: "8:00 PM", item: "Dancing" },
  ],
  dressCode: "Garden formal — soft pastels welcome",
};

export type Wedding = typeof weddingDefaults;

export const WEDDING_CACHE_TAG = "wedding";
