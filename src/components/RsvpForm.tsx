"use client";

import { useActionState } from "react";
import { submitRsvp, type RsvpState } from "@/app/(site)/i/[code]/actions";
import type { Guest } from "@/lib/supabase";

const inputClass =
  "w-full border-b border-accent/40 bg-transparent px-1 py-2 text-lg outline-none focus:border-accent placeholder:text-foreground/40";

function RecordedResponse({ guest }: { guest: Guest }) {
  if (guest.attending === null) {
    return <p>We haven&apos;t received your response.</p>;
  }
  if (!guest.attending) {
    return <p>You let us know you can&apos;t make it. You&apos;ll be missed!</p>;
  }
  return (
    <p>
      You&apos;re coming with {guest.guest_count}{" "}
      {guest.guest_count === 1 ? "guest" : "guests"} in total. We can&apos;t wait!
    </p>
  );
}

export default function RsvpForm({ guest, open }: { guest: Guest; open: boolean }) {
  const [state, formAction, pending] = useActionState<RsvpState, FormData>(
    submitRsvp.bind(null, guest.code),
    { status: "idle" },
  );

  if (!open) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center text-xl">
        <RecordedResponse guest={guest} />
        <p className="text-lg italic text-foreground/70">
          RSVPs have closed. For any changes, please contact the couple directly.
        </p>
      </div>
    );
  }

  if (state.status === "success") {
    return (
      <p className="text-center text-2xl">
        {state.attending
          ? `Thank you, ${guest.name}! We can't wait to celebrate with you.`
          : `Thank you for letting us know, ${guest.name}. You'll be missed!`}
      </p>
    );
  }

  const defaultAttending = guest.attending === null ? undefined : guest.attending ? "yes" : "no";

  return (
    <form action={formAction} className="mx-auto grid max-w-md gap-6">
      {guest.responded_at && (
        <p className="text-center italic text-foreground/70">
          You&apos;ve already replied. Feel free to update your response below.
        </p>
      )}
      <div className="flex justify-center gap-6 text-lg">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="attending"
            value="yes"
            required
            defaultChecked={defaultAttending === "yes"}
            className="accent-accent"
          />
          Joyfully accepts
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="attending"
            value="no"
            defaultChecked={defaultAttending === "no"}
            className="accent-accent"
          />
          Regretfully declines
        </label>
      </div>
      {guest.party_size > 1 ? (
        <select
          name="guests"
          aria-label="Number of guests attending"
          defaultValue={String(guest.guest_count || guest.party_size)}
          className={inputClass}
        >
          {Array.from({ length: guest.party_size }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "guest" : "guests"}
            </option>
          ))}
        </select>
      ) : (
        <input type="hidden" name="guests" value="1" />
      )}
      <textarea
        name="message"
        rows={3}
        maxLength={2000}
        defaultValue={guest.message ?? ""}
        placeholder="Dietary needs or a note for the couple"
        className={inputClass}
      />
      {state.status === "error" && (
        <p role="alert" className="text-center text-red-700">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-accent px-8 py-3 text-sm uppercase tracking-[0.25em] text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Sending…" : guest.responded_at ? "Update RSVP" : "Send RSVP"}
      </button>
    </form>
  );
}
