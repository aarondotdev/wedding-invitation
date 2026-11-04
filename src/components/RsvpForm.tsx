"use client";

import { useActionState } from "react";
import { submitRsvp, type RsvpState } from "@/app/(site)/i/[code]/actions";
import { fill, type PageText } from "@/lib/site-content-defaults";
import type { Guest } from "@/lib/supabase";

type Labels = PageText["rsvpForm"];
type Messages = PageText["rsvpMessages"];

const inputClass =
  "w-full border-b border-line bg-transparent px-1 py-3 text-lg outline-none transition-colors focus:border-accent placeholder:text-muted [&>option]:bg-surface";

const guestCount = (n: number, labels: Labels) =>
  `${n} ${n === 1 ? labels.guestSingular : labels.guestPlural}`;

function RecordedResponse({ guest, labels, messages }: { guest: Guest; labels: Labels; messages: Messages }) {
  if (guest.attending === null) return <p>{messages.noResponse}</p>;
  if (!guest.attending) return <p>{messages.recordedDeclined}</p>;
  return <p>{fill(messages.recordedAttending, { count: guestCount(guest.guest_count ?? 0, labels) })}</p>;
}

// A large selectable card around a real (visually hidden) radio button, so keyboard and screen
// readers work as normal; the selected card gets a gold background.
function ChoiceCard({
  value,
  label,
  note,
  required,
  defaultChecked,
}: {
  value: "yes" | "no";
  label: string;
  note: string;
  required?: boolean;
  defaultChecked: boolean;
}) {
  return (
    // Same cream and gold silk background as The Venues section
    <label className="group relative isolate flex cursor-pointer flex-col items-center gap-2 overflow-hidden border border-line bg-[#e8ddd0] p-5 text-center text-[#3b0d18] transition-colors duration-300 hover:bg-[#e2d4c3] has-checked:bg-[#d8c3a5] has-focus-visible:ring-2 has-focus-visible:ring-accent-ink has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background sm:p-6">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-10 mix-blend-multiply"
        style={{ backgroundImage: "url(/images/details-silk-v1.webp)" }}
      />
      <input type="radio" name="attending" value={value} required={required} defaultChecked={defaultChecked} className="sr-only" />
      <span className="font-(family-name:--ff-inria-serif) text-xl font-medium leading-tight sm:text-2xl">{label}</span>
      {note && <span className="font-(family-name:--ff-inria-serif) text-sm leading-snug text-[#3b0d18]/80">{note}</span>}
    </label>
  );
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
        <p className="text-lg italic text-muted">{messages.closed}</p>
      </div>
    );
  }

  if (state.status === "success") {
    return (
      <p className="text-center font-display text-3xl leading-snug md:text-4xl">
        {fill(state.attending ? messages.thanksAttending : messages.thanksDeclined, { name: guest.name })}
      </p>
    );
  }

  const defaultAttending = guest.attending === null ? undefined : guest.attending ? "yes" : "no";

  return (
    <form action={formAction} className="mx-auto grid max-w-xl gap-8">
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        <ChoiceCard
          value="yes"
          label={labels.accept}
          note={labels.acceptNote}
          required
          defaultChecked={defaultAttending === "yes"}
        />
        <ChoiceCard value="no" label={labels.decline} note={labels.declineNote} defaultChecked={defaultAttending === "no"} />
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
        <p role="alert" className="text-center text-red-300">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-linear-to-b from-[#f3d58d] via-[#d4ae62] to-[#a8822e] px-8 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#3b0d18] shadow-[0_0_14px_rgba(230,190,98,0.35)] transition hover:brightness-110 hover:shadow-[0_0_22px_rgba(230,190,98,0.5)] disabled:opacity-60"
      >
        {pending ? labels.sendingButton : guest.responded_at ? labels.updateButton : labels.sendButton}
      </button>
    </form>
  );
}
