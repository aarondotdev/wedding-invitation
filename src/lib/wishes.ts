import "server-only";

import config from "@payload-config";
import { cache } from "react";
import { getPayload } from "payload";
import type { Guest } from "@/lib/supabase";

// A congratulations message left by a guest, shown to everyone on the invitation.
// Stored as the "Well wishes" collection in Payload, so the couple can hide or delete messages in
// /cms. One per guest: posting again replaces their earlier message.
export type Wish = {
  id: string;
  guest_id: string;
  name: string;
  message: string;
  created_at: string;
};

export const MAX_WISH_LENGTH = 500;
const MAX_WISHES_SHOWN = 80;

// Newest first; messages the couple hid in the CMS are left out.
export const listWishes = cache(async (): Promise<Wish[]> => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "wishes",
    where: { hidden: { not_equals: true } },
    sort: "-createdAt",
    limit: MAX_WISHES_SHOWN,
    depth: 0,
  });
  return docs.map((d) => ({
    id: String(d.id),
    guest_id: d.guestId,
    name: d.name,
    message: d.message,
    created_at: d.createdAt,
  }));
});

// Keeps the name on a guest's message in step with the guest list (called when the admin saves a
// guest). Runs on every save, so re-saving a guest also fixes a name changed before this existed.
export async function renameWishAuthor(guestId: string, name: string): Promise<void> {
  const payload = await getPayload({ config });
  await payload.update({
    collection: "wishes",
    where: { and: [{ guestId: { equals: guestId } }, { name: { not_equals: name } }] },
    data: { name },
    depth: 0,
  });
}

// Creates the guest's message, or replaces the one they left before (and un-hides it).
export async function saveWish(guest: Guest, message: string): Promise<void> {
  const payload = await getPayload({ config });
  const existing = await payload.find({ collection: "wishes", where: { guestId: { equals: guest.id } }, limit: 1, depth: 0 });
  const data = { name: guest.name, message, hidden: false };
  if (existing.docs[0]) {
    await payload.update({ collection: "wishes", id: existing.docs[0].id, data });
  } else {
    await payload.create({ collection: "wishes", data: { ...data, guestId: guest.id } });
  }
}
