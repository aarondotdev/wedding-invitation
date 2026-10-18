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
  if (!doc.updatedAt) {
    return { ...weddingDefaults, events: weddingDefaults.events.map((e) => ({ ...e, photo: null })) };
  }

  return {
    partner1: doc.partner1,
    partner2: doc.partner2,
    date: doc.date,
    displayDate: doc.displayDate,
    hashtag: doc.hashtag ?? "",
    rsvpBy: doc.rsvpBy,
    rsvpDeadline: doc.rsvpDeadline,
    events: doc.events.map(({ title, time, venue, address, mapUrl, photo }) => ({
      title,
      time,
      venue,
      address,
      mapUrl: mapUrl ?? "",
      photo: toPhoto(photo),
    })),
    schedule: (doc.schedule ?? []).map(({ time, item }) => ({ time, item })),
    dressCode: doc.dressCode ?? "",
  };
}

// A populated upload field as a plain photo, or null when empty / not populated
export function toPhoto(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const m = value as { url?: string | null; width?: number | null; height?: number | null; alt?: string };
  if (!m.url) return null;
  return { url: m.url, width: m.width ?? 1200, height: m.height ?? 1500, alt: m.alt ?? "" };
}

export async function isRsvpOpen() {
  const { rsvpDeadline } = await getWedding();
  return Date.now() <= new Date(rsvpDeadline).getTime();
}
