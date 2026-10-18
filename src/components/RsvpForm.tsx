"use client";

import { useActionState } from "react";
import { submitRsvp, type RsvpState } from "@/app/(site)/i/[code]/actions";
import { fill, type PageText } from "@/lib/site-content-defaults";
import type { Guest } from "@/lib/supabase";

type Labels = PageText["rsvpForm"];
type Messages = PageText["rsvpMessages"];

const inputClass =
  "w-full border-b border-accent/40 bg-transparent px-1 py-2 text-lg outline-none focus:border-accent placeholder:text-foreground/40";

const guestCount = (n: number, labels: Labels) =>
  `${n} ${n === 1 ? labels.guestSingular : labels.guestPlural}`;

function RecordedResponse({ guest, labels, messages }: { guest: Guest; labels: Labels; messages: Messages }) {
  if (guest.attending === null) return <p>{messages.noResponse}</p>;
  if (!guest.attending) return <p>{messages.recordedDeclined}</p>;
  return <p>{fill(messages.recordedAttending, { count: guestCount(guest.guest_count ?? 0, labels) })}</p>;
}

export default function RsvpForm({
  guest,
  open,
  labels,
  messages,
}: {
  guest: Guest;
  open: boolean;
  labels: Labels;
  messages: Messages;
}) {
  const [state, formAction, pending] = useActionState<RsvpState, FormData>(
    submitRsvp.bind(null, guest.code),
    { status: "idle" },
  );

  if (!open) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center text-xl">
        <RecordedResponse guest={guest} labels={labels} messages={messages} />
        <p className="text-lg italic text-foreground/70">{messages.closed}</p>
      </div>
    );
  }

  if (state.status === "success") {
    return (
      <p className="text-center text-2xl">
        {fill(state.attending ? messages.thanksAttending : messages.thanksDeclined, { name: guest.name })}
      </p>
    );
  }

  const defaultAttending = guest.attending === null ? undefined : guest.attending ? "yes" : "no";

  return (
    <form action={formAction} className="mx-auto grid max-w-md gap-6">
      {guest.responded_at && (
        <p className="text-center italic text-foreground/70">{messages.alreadyReplied}</p>
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
          {labels.accept}
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="attending"
            value="no"
            defaultChecked={defaultAttending === "no"}
            className="accent-accent"
          />
          {labels.decline}
        </label>
      </div>
      {guest.party_size > 1 ? (
        <select
          name="guests"
          aria-label={labels.guestCountLabel}
          defaultValue={String(guest.guest_count || guest.party_size)}
          className={inputClass}
        >
          {Array.from({ length: guest.party_size }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {guestCount(n, labels)}
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
        placeholder={labels.messagePlaceholder}
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
        {pending ? labels.sendingButton : guest.responded_at ? labels.updateButton : labels.sendButton}
      </button>
    </form>
  );
}
