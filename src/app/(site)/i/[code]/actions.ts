"use server";

import { getPageText } from "@/lib/site-content";
import { fill } from "@/lib/site-content-defaults";
import { getGuestByCode, supabaseAdmin } from "@/lib/supabase";
import { isRsvpOpen } from "@/lib/wedding";

export type RsvpState =
  | { status: "idle" }
  | { status: "success"; attending: boolean }
  | { status: "error"; message: string };

const MAX_MESSAGE_LENGTH = 2000;

// The code is bound by RsvpForm; everything is re-validated here since requests can be forged.
export async function submitRsvp(
  code: string,
  _prev: RsvpState,
  formData: FormData,
): Promise<RsvpState> {
  const { rsvpMessages: m, rsvpForm } = await getPageText();

  if (!(await isRsvpOpen())) {
    return { status: "error", message: m.errorClosed };
  }

  const guest = await getGuestByCode(code);
  if (!guest) {
    return { status: "error", message: m.errorInvalidLink };
  }

  const attendingValue = formData.get("attending");
  if (attendingValue !== "yes" && attendingValue !== "no") {
    return { status: "error", message: m.errorChooseAttendance };
  }
  const attending = attendingValue === "yes";

  let guestCount = 0;
  if (attending) {
    guestCount = Number(formData.get("guests") ?? 1);
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > guest.party_size) {
      return {
        status: "error",
        message: fill(m.errorGuestCount, {
          max: `${guest.party_size} ${guest.party_size === 1 ? rsvpForm.guestSingular : rsvpForm.guestPlural}`,
        }),
      };
    }
  }

  const message = String(formData.get("message") ?? "").trim().slice(0, MAX_MESSAGE_LENGTH);

  const { error } = await supabaseAdmin()
    .from("guests")
    .update({
      attending,
      guest_count: guestCount,
      message: message || null,
      responded_at: new Date().toISOString(),
    })
    .eq("id", guest.id)
    .is("revoked_at", null);

  if (error) {
    console.error("RSVP update failed", error);
    return { status: "error", message: m.errorGeneric };
  }

  return { status: "success", attending };
}
