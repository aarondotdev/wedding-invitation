"use client";

import { useActionState } from "react";
import { addGuest, type FormState } from "./actions";
import CopyButton from "./CopyButton";
import GuestFields, { primaryButton } from "./GuestFields";

export default function AddGuestForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addGuest, { status: "idle" });

  return (
    <form action={action} className="space-y-4 rounded-lg border border-neutral-200 p-5">
      <h2 className="font-semibold">Add a guest</h2>
      <GuestFields />
      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-700">{state.message}</p>
      )}
      {state.status === "success" && state.url && (
        <div className="space-y-2 rounded-md bg-green-50 p-3 text-sm">
          <p className="text-green-800">{state.message} Their personal link:</p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="break-all rounded bg-white px-2 py-1">{state.url}</code>
            <CopyButton text={state.url} />
          </div>
        </div>
      )}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Adding…" : "Add guest & create link"}
      </button>
    </form>
  );
}
