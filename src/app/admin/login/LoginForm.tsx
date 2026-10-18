"use client";

import { useActionState } from "react";
import { sendCode, verifyCode, type LoginState } from "./actions";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";
const buttonClass =
  "w-full rounded-md bg-accent px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-60";

export default function LoginForm({ initialError }: { initialError?: string }) {
  const [emailState, sendAction, sending] = useActionState<LoginState, FormData>(sendCode, {
    step: "email",
    error: initialError,
  });
  const [codeState, verifyAction, verifying] = useActionState<LoginState, FormData>(verifyCode, {
    step: "email",
  });

  if (emailState.step === "email") {
    return (
      <form action={sendAction} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Email</span>
          <input name="email" type="email" required autoComplete="email" autoFocus className={inputClass} />
        </label>
        {emailState.error && (
          <p role="alert" className="text-sm text-red-700">
            {emailState.error}
          </p>
        )}
        <button type="submit" disabled={sending} className={buttonClass}>
          {sending ? "Sending…" : "Email me a sign-in code"}
        </button>
      </form>
    );
  }

  const error = codeState.step === "code" ? codeState.error : undefined;
  return (
    <form action={verifyAction} className="space-y-4">
      <p className="text-sm text-neutral-600">
        If <strong>{emailState.email}</strong> is allowed to sign in, we&apos;ve emailed it a
        code. You can also just click the link in that email.
      </p>
      <input type="hidden" name="email" value={emailState.email} />
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Sign-in code</span>
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          autoFocus
          className={`${inputClass} tracking-[0.3em]`}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="submit" disabled={verifying} className={buttonClass}>
        {verifying ? "Checking…" : "Sign in"}
      </button>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="w-full text-sm text-neutral-500 underline-offset-2 hover:underline"
      >
        Use a different email
      </button>
    </form>
  );
}
