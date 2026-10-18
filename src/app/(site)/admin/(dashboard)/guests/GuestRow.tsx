"use client";

import { useActionState, useState, useTransition } from "react";
import type { AdminGuest } from "@/lib/guests";
import { deleteGuest, reissueGuest, setRevoked, updateGuest, type FormState } from "./actions";
import CopyButton from "./CopyButton";
import GuestFields, { primaryButton } from "./GuestFields";

const smallButton = "rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50";

function RsvpBadge({ guest }: { guest: AdminGuest }) {
  if (guest.attending === null) return <span className="text-black">No reply</span>;
  if (!guest.attending) return <span className="text-red-700">Declined</span>;
  return <span className="text-green-700">Attending · {guest.guest_count}</span>;
}

export default function GuestRow({ guest, url }: { guest: AdminGuest; url: string }) {
  const [editing, setEditing] = useState(false);
  const [busy, startTransition] = useTransition();
  const [editState, editAction, saving] = useActionState<FormState, FormData>(
    async (prev, formData) => {
      const result = await updateGuest(guest.id, prev, formData);
      if (result.status === "success") setEditing(false);
      return result;
    },
    { status: "idle" },
  );

  const run = (fn: () => Promise<void>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    startTransition(fn);
  };

  const revoked = Boolean(guest.revoked_at);

  return (
    <>
      <tr className={`border-t border-neutral-200 align-top ${revoked ? "bg-neutral-50 text-black" : ""}`}>
        <td className="px-3 py-3">
          <p className="font-medium text-black">{guest.name}</p>
          <p className="text-xs text-black">
            {[guest.phone, guest.email].filter(Boolean).join(" · ")}
          </p>
          {guest.notes && <p className="text-xs italic text-black">{guest.notes}</p>}
          {guest.message && <p className="mt-1 text-xs text-black">“{guest.message}”</p>}
        </td>
        <td className="px-3 py-3">{guest.party_size}</td>
        <td className="px-3 py-3">
          <RsvpBadge guest={guest} />
          <p className="text-xs text-black">{guest.opened_at ? "Opened link" : "Not opened yet"}</p>
        </td>
        <td className="px-3 py-3">
          {revoked ? (
            <span className="text-xs font-medium uppercase text-black">Revoked</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              <CopyButton text={url} />
              {/* No "open" button: visiting the link would mark it as opened by the guest */}
              <a href={`/admin/guests/${guest.id}/qr`} className={smallButton}>QR</a>
            </div>
          )}
        </td>
        <td className="px-3 py-3">
          <div className="flex flex-wrap justify-end gap-1">
            <button type="button" className={smallButton} onClick={() => setEditing((e) => !e)}>
              {editing ? "Close" : "Edit"}
            </button>
            <button
              type="button"
              disabled={busy}
              className={smallButton}
              onClick={() =>
                run(
                  () => reissueGuest(guest.id),
                  `Give ${guest.name} a new link? Their current link will stop working. Their RSVP is kept.`,
                )
              }
            >
              New link
            </button>
            <button
              type="button"
              disabled={busy}
              className={smallButton}
              onClick={() => run(() => setRevoked(guest.id, !revoked))}
              title={revoked ? "Make this link work again" : "Disable this link (can be undone)"}
            >
              {revoked ? "Restore" : "Revoke"}
            </button>
            <button
              type="button"
              disabled={busy}
              className={`${smallButton} text-red-700`}
              onClick={() =>
                run(
                  () => deleteGuest(guest.id),
                  `Permanently delete ${guest.name} and their RSVP? This can't be undone. (Revoke instead if you might need them back.)`,
                )
              }
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      {editing && (
        <tr className="border-t border-neutral-100 bg-neutral-50">
          <td colSpan={5} className="px-3 py-4">
            <form action={editAction} className="space-y-3">
              <GuestFields guest={guest} />
              {editState.status === "error" && (
                <p role="alert" className="text-sm text-red-700">{editState.message}</p>
              )}
              <button type="submit" disabled={saving} className={primaryButton}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          </td>
        </tr>
      )}
    </>
  );
}
