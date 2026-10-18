import Countdown from "@/components/Countdown";
import Divider from "@/components/Divider";
import RsvpForm from "@/components/RsvpForm";
import type { Guest } from "@/lib/supabase";
import { wedding } from "@/lib/wedding";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-center font-script text-5xl text-accent sm:text-6xl">
      {children}
    </h2>
  );
}

export default function Invitation({
  guest,
  rsvpOpen,
}: {
  guest: Guest;
  rsvpOpen: boolean;
}) {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blush to-background px-6 text-center">
        <div className="animate-fade-up">
          <p className="mb-8 text-2xl italic sm:text-3xl">Dear {guest.name},</p>
          <p className="text-sm uppercase tracking-[0.4em] text-accent">
            Together with their families
          </p>
          <h1 className="mt-8 font-script text-7xl leading-tight sm:text-8xl md:text-9xl">
            {wedding.partner1}
            <span className="mx-4 block text-5xl text-accent sm:inline sm:text-6xl">&amp;</span>
            {wedding.partner2}
          </h1>
          <p className="mt-6 text-xl italic sm:text-2xl">
            request the pleasure of your company
          </p>
          <Divider />
          <p className="text-2xl tracking-wide sm:text-3xl">{wedding.displayDate}</p>
          <p className="mt-2 text-lg text-foreground/70">{wedding.events[0].venue}</p>
          <a
            href="#rsvp"
            className="mt-10 inline-block rounded-full border border-accent px-8 py-3 text-sm uppercase tracking-[0.25em] text-accent transition hover:bg-accent hover:text-white"
          >
            RSVP
          </a>
        </div>
      </section>

      {/* Countdown */}
      <section className="px-6 py-20">
        <SectionTitle>Counting down</SectionTitle>
        <div className="mt-10">
          <Countdown date={wedding.date} />
        </div>
      </section>

      {/* Events */}
      <section className="bg-blush/50 px-6 py-20">
        <SectionTitle>The Celebration</SectionTitle>
        <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
          {wedding.events.map((event) => (
            <div
              key={event.title}
              className="rounded-2xl border border-accent/30 bg-background p-8 text-center shadow-sm"
            >
              <h3 className="text-sm uppercase tracking-[0.3em] text-accent">
                {event.title}
              </h3>
              <p className="mt-4 text-3xl">{event.time}</p>
              <p className="mt-4 text-xl font-medium">{event.venue}</p>
              <p className="text-foreground/70">{event.address}</p>
              <a
                href={event.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block text-sm uppercase tracking-[0.2em] text-accent underline-offset-4 hover:underline"
              >
                View map
              </a>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-lg italic">
          Dress code: {wedding.dressCode}
        </p>
      </section>

      {/* Schedule */}
      <section className="px-6 py-20">
        <SectionTitle>Order of the Day</SectionTitle>
        <ol className="mx-auto mt-12 max-w-md">
          {wedding.schedule.map((s) => (
            <li
              key={s.time}
              className="flex justify-between border-b border-accent/20 py-4 text-xl"
            >
              <span className="text-accent">{s.time}</span>
              <span>{s.item}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* RSVP */}
      <section id="rsvp" className="bg-blush/50 px-6 py-20">
        <SectionTitle>Kindly Reply</SectionTitle>
        {rsvpOpen && (
          <p className="mb-10 mt-4 text-center text-lg">
            Please respond by {wedding.rsvpBy}
          </p>
        )}
        <RsvpForm guest={guest} open={rsvpOpen} />
      </section>

      <footer className="px-6 py-12 text-center">
        <p className="font-script text-4xl">
          {wedding.partner1} &amp; {wedding.partner2}
        </p>
        <p className="mt-2 text-sm uppercase tracking-[0.3em] text-accent">
          {wedding.hashtag}
        </p>
      </footer>
    </main>
  );
}
