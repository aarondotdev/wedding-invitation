import "server-only";

import config from "@payload-config";
import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import { WEDDING_CACHE_TAG, weddingDefaults, type Wedding } from "@/lib/wedding-defaults";

export type { Wedding };

// Cached until the Wedding global is saved in the CMS (its afterChange hook expires the tag).
export async function getWedding(): Promise<Wedding> {
  "use cache";
  cacheLife("max");
  cacheTag(WEDDING_CACHE_TAG);

  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: "wedding" });

  // A global that has never been saved has no row yet
  if (!doc.updatedAt) return weddingDefaults;

  return {
    partner1: doc.partner1,
    partner2: doc.partner2,
    date: doc.date,
    displayDate: doc.displayDate,
    hashtag: doc.hashtag ?? "",
    rsvpBy: doc.rsvpBy,
    rsvpDeadline: doc.rsvpDeadline,
    events: doc.events.map(({ title, time, venue, address, mapUrl }) => ({
      title,
      time,
      venue,
      address,
      mapUrl: mapUrl ?? "",
    })),
    schedule: (doc.schedule ?? []).map(({ time, item }) => ({ time, item })),
    dressCode: doc.dressCode ?? "",
  };
}

export async function isRsvpOpen() {
  const { rsvpDeadline } = await getWedding();
  return Date.now() <= new Date(rsvpDeadline).getTime();
}
