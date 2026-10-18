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
// readers work as normal; the selected card gets a gold border and dot.
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
    <label className="group relative flex min-h-40 cursor-pointer flex-col justify-between gap-6 border border-line p-5 text-left transition-colors duration-300 hover:border-accent/60 has-checked:border-accent-ink has-checked:bg-accent/10 has-focus-visible:ring-2 has-focus-visible:ring-accent-ink has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background sm:p-7">
      <input type="radio" name="attending" value={value} required={required} defaultChecked={defaultChecked} className="sr-only" />
      <span
        aria-hidden
        className="absolute right-4 top-4 h-3.5 w-3.5 rounded-full border border-line transition-colors group-has-checked:border-accent-ink group-has-checked:bg-accent-ink sm:right-5 sm:top-5"
      />
      <span className="pr-6 font-display text-2xl leading-tight sm:text-3xl">{label}</span>
      {note && <span className="text-sm leading-snug text-muted group-has-checked:text-foreground/80">{note}</span>}
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
      {guest.responded_at && (
        <p className="text-center italic text-muted">{messages.alreadyReplied}</p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
        className="mt-2 rounded-full bg-accent-ink px-8 py-4 text-xs font-medium uppercase tracking-[0.3em] text-background transition hover:bg-foreground disabled:opacity-60"
      >
        {pending ? labels.sendingButton : guest.responded_at ? labels.updateButton : labels.sendButton}
      </button>
    </form>
  );
}
