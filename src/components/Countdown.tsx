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

  const nums = [labels.days, labels.hours, labels.minutes, labels.seconds];
  return (
    <div className="text-center">
      <p className="font-sans text-base sm:text-lg" style={{ color: "#3b0d18" }}>
        Days left before we say <span className="font-script text-2xl sm:text-3xl" style={{ color: "#3b0d18" }}>&ldquo;I do&rdquo;</span>
      </p>
      <div className="mt-6 flex items-baseline justify-center gap-1 sm:gap-2">
        {nums.map((label, i) => (
          <div key={i} className="flex items-baseline">
            {i > 0 && <span className="mx-1 font-sans text-3xl font-bold sm:mx-2 sm:text-5xl md:text-6xl" style={{ color: "#3b0d18" }}>:</span>}
            <div className="flex flex-col items-center">
              <span className="font-sans text-4xl font-bold tabular-nums sm:text-5xl md:text-6xl" style={{ color: "#3b0d18" }}>
                {values ? String(values[i]).padStart(2, "0") : "--"}
              </span>
              <span className="mt-1 text-[0.5rem] font-medium uppercase tracking-[0.25em] sm:text-[0.65rem]" style={{ color: "#8a6516" }}>
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
