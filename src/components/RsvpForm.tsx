"use client";

import { useState } from "react";

const inputClass =
  "w-full border-b border-accent/40 bg-transparent px-1 py-2 text-lg outline-none focus:border-accent placeholder:text-foreground/40";

export default function RsvpForm() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // TODO: send `data` to a backend (API route, Google Sheet, Formspree, etc.)
    setSubmitted(String(data.get("name")));
  }

  if (submitted) {
    return (
      <p className="text-center text-2xl">
        Thank you, {submitted}! Your response has been received.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto grid max-w-md gap-6">
      <input name="name" required placeholder="Full name" className={inputClass} />
      <input name="email" type="email" required placeholder="Email" className={inputClass} />
      <div className="flex justify-center gap-6 text-lg">
        <label className="flex items-center gap-2">
          <input type="radio" name="attending" value="yes" required className="accent-accent" />
          Joyfully accepts
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="attending" value="no" className="accent-accent" />
          Regretfully declines
        </label>
      </div>
      <select name="guests" defaultValue="1" className={inputClass}>
        {[1, 2, 3, 4].map((n) => (
          <option key={n} value={n}>
            {n} {n === 1 ? "guest" : "guests"}
          </option>
        ))}
      </select>
      <textarea
        name="message"
        rows={3}
        placeholder="Dietary needs or a note for the couple"
        className={inputClass}
      />
      <button
        type="submit"
        className="mt-2 rounded-full bg-accent px-8 py-3 text-sm uppercase tracking-[0.25em] text-white transition hover:opacity-90"
      >
        Send RSVP
      </button>
    </form>
  );
}
