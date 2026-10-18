"use client";

import { useSyncExternalStore } from "react";

const LABELS = ["Days", "Hours", "Minutes", "Seconds"] as const;

function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}

// Current time in whole seconds, so the snapshot is stable within each tick.
const getNow = () => Math.floor(Date.now() / 1000);
const getServerNow = () => null;

export default function Countdown({ date }: { date: string }) {
  const now = useSyncExternalStore(subscribe, getNow, getServerNow);
  const target = Math.floor(new Date(date).getTime() / 1000);
  const diff = now === null ? null : Math.max(0, target - now);

  const values =
    diff === null
      ? null
      : [
          Math.floor(diff / 86_400),
          Math.floor((diff / 3_600) % 24),
          Math.floor((diff / 60) % 60),
          diff % 60,
        ];

  return (
    <div className="flex justify-center gap-4 sm:gap-8">
      {LABELS.map((label, i) => (
        <div key={label} className="flex flex-col items-center">
          <span className="text-4xl sm:text-5xl font-light tabular-nums">
            {values ? String(values[i]).padStart(2, "0") : "--"}
          </span>
          <span className="mt-1 text-xs uppercase tracking-[0.25em] text-accent">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
