"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

export default function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {
    error: initialError,
  });

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
          defaultValue={state.email}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-accent px-4 py-2 font-medium text-black transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
