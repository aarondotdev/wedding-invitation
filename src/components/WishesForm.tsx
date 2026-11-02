"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { submitWish, type WishState } from "@/app/(site)/i/[code]/actions";
import { fill, type PageText } from "@/lib/site-content-defaults";
import type { Guest } from "@/lib/supabase";

type Text = PageText["wishes"];

// The message box for the well-wishes section. One message per guest: posting again replaces it.
// The list itself is server-rendered by Invitation; after a successful post the page data is
// refreshed so the new message appears at the top.
export default function WishesForm({
  guest,
  existing,
  maxLength,
  text,
}: {
  guest: Guest;
  /** The guest's current message, if they already left one */
  existing: string | null;
  maxLength: number;
  text: Text;
}) {
  const router = useRouter();
  // Controlled so the text survives an error (React resets uncontrolled forms after every action)
  // and is cleared only once the message is saved.
  const [draft, setDraft] = useState("");
  const [state, formAction, pending] = useActionState<WishState, FormData>(async (prev, formData) => {
    const result = await submitWish(guest.code, prev, formData);
    if (result.status === "success") setDraft("");
    return result;
  }, { status: "idle" });

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [state, router]);

  return (
    <form action={formAction} className="mx-auto flex w-full max-w-xl flex-col gap-4">
      {state.status === "success" ? (
        <p className="text-center text-lg text-accent-ink">{fill(text.thanks, { name: guest.name })}</p>
      ) : (
        existing && <p className="text-center text-sm italic text-muted">{text.alreadyPosted}</p>
      )}
      <textarea
        name="message"
        rows={4}
        maxLength={maxLength}
        required
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={text.placeholder}
        aria-label={text.placeholder}
        className="w-full border border-line bg-surface/40 px-5 py-4 text-base leading-relaxed outline-none transition-colors placeholder:text-muted focus:border-accent-ink"
      />
      {state.status === "error" && (
        <p role="alert" className="text-center text-sm text-accent-ink">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mx-auto rounded-full bg-linear-to-b from-[#f3d58d] via-[#d4ae62] to-[#a8822e] px-8 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#3b0d18] shadow-[0_0_14px_rgba(230,190,98,0.35)] transition hover:brightness-110 hover:shadow-[0_0_22px_rgba(230,190,98,0.5)] disabled:opacity-60"
      >
        {pending ? text.sendingButton : existing ? text.updateButton : text.sendButton}
      </button>
    </form>
  );
}
