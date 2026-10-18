"use client";

import { useSyncExternalStore } from "react";
import type { PageText } from "@/lib/site-content-defaults";

function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}

// Current time in whole seconds, so the snapshot is stable within each tick.
const getNow = () => Math.floor(Date.now() / 1000);
const getServerNow = () => null;

export default function Countdown({
  date,
  labels,
}: {
  date: string;
  labels: PageText["countdown"];
}) {
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
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 sm:gap-8">
      {[labels.days, labels.hours, labels.minutes, labels.seconds].map((label, i) => (
        <div key={i} className="flex flex-col items-start border-l border-line pl-4 sm:pl-6">
          <span className="font-display text-6xl tabular-nums md:text-8xl">
            {values ? String(values[i]).padStart(2, "0") : "--"}
          </span>
          <span className="mt-3 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-accent-ink sm:text-xs">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
