import { Fragment } from "react";
import Image from "next/image";
import Countdown from "@/components/Countdown";
import InvitationMotion from "@/components/motion/InvitationMotion";
import HeroParticles from "@/components/HeroParticles";
import GlitterCascade from "@/components/motion/GlitterCascade";
import SongPlayerControls from "@/components/SongPlayerControls";
import RsvpForm from "@/components/RsvpForm";
import WishesForm from "@/components/WishesForm";
import type { Details, Entourage, GalleryPhoto, NameGroup } from "@/lib/details-defaults";
import { fill, focalPosition, type PagePhotos, type PageText, type SitePhoto, type StoryChapter } from "@/lib/site-content-defaults";
import type { Guest } from "@/lib/supabase";
import { MAX_WISH_LENGTH, type Wish } from "@/lib/wishes";
import type { Wedding } from "@/lib/wedding-defaults";
import { themeScopeProps } from "@/theme/apply";

const pad = (n: number) => String(n).padStart(2, "0");

// "01 — Our story" with a hairline, as in an editorial spread
function SectionLabel({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <div data-fade className="border-b-2 border-line pb-4 text-xs font-medium uppercase tracking-[0.2em] text-accent-ink">
      {pad(index)} — {children}
    </div>
  );
}

// Black-and-white photo that unmasks on scroll and drifts slightly slower than the page
function Photo({
  photo,
  className,
  sizes,
  priority,
  dim,
}: {
  photo: SitePhoto;
  className?: string;
  sizes: string;
  priority?: boolean;
  // Darken slightly so text laid over the photo stays readable
  dim?: boolean;
}) {
  return (
    <div data-reveal className={`relative overflow-hidden ${className ?? ""}`}>
      <div data-parallax="6" className="absolute -inset-y-[8%] inset-x-0">
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover grayscale ${dim ? "brightness-[0.72]" : ""}`}
          style={{ objectPosition: focalPosition(photo) }}
        />
      </div>
    </div>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg data-draw aria-hidden viewBox="0 0 160 220" fill="none" className={className}>
      <path d="M20 10C110 40 140 120 95 205" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M60 175C75 185 88 195 95 205C103 190 115 178 135 170" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Numbered row with a large portrait photo that alternates sides, like the class list in the
 * reference design. Without a photo the text spans the full width.
 */
function FeatureRow({
  index,
  title,
  photo,
  flipped,
  children,
}: {
  index: number;
  title: string;
  photo: SitePhoto | null;
  flipped: boolean;
  children?: React.ReactNode;
}) {
  return (
    <article className="grid items-center gap-10 md:grid-cols-12 md:gap-8">
      {photo && (
        <Photo
          photo={photo}
          sizes="(min-width: 768px) 38vw, 100vw"
          className={`aspect-[7/10] w-full md:col-span-5 ${flipped ? "md:order-2 md:col-start-8" : ""}`}
        />
      )}
      <div
        className={
          photo
            ? flipped
              ? "md:col-span-5 md:col-start-2 md:text-right"
              : "md:col-span-5 md:col-start-7"
            : "md:col-span-12 md:grid md:grid-cols-2 md:gap-20"
        }
      >
        <div>
          <p data-fade className="text-sm font-medium text-accent-ink">{pad(index)}</p>
          <h3 data-split className="mt-8 font-display text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.95]">
            {title}
          </h3>
        </div>
        <div data-fade className={`mt-8 text-sm leading-relaxed text-muted sm:text-lg ${photo && flipped ? "md:ml-auto" : ""} max-w-md`}>
          {children}
        </div>
      </div>
    </article>
  );
}

// When a well-wish was posted, in the wedding's time zone (Philippines), e.g. "Nov 2, 2026 · 9:05 AM"
const wishTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
function formatWishTime(iso: string) {
  const parts = wishTime.formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("month")} ${get("day")}, ${get("year")} · ${get("hour")}:${get("minute")} ${get("dayPeriod")}`;
}

// The FAQ section is hidden for now; set to true to show it again (its questions are kept in the CMS)
const SHOW_FAQ = false;

// Bento tile sizes on phones. A block of five tiles fills a 2-column grid exactly:
//   [big 2x2] / [tall][small] / [ ... ][small] / [wide 2x1]
// A shorter final block uses a pattern that still ends flush, so the grid never has holes.
// Tablet and desktop ignore these spans.
const BENTO = {
  big: "max-md:col-span-2 max-md:row-span-2",
  tall: "max-md:row-span-2",
  wide: "max-md:col-span-2",
  small: "",
};
const BENTO_BLOCK = [BENTO.big, BENTO.tall, BENTO.small, BENTO.small, BENTO.wide];
const BENTO_TAIL: Record<number, string[]> = {
  1: [BENTO.big],
  2: [BENTO.big, BENTO.wide],
  3: [BENTO.big, BENTO.small, BENTO.small],
  4: [BENTO.big, BENTO.tall, BENTO.small, BENTO.small],
};
function bentoTile(index: number, total: number) {
  const tailStart = total - (total % 5);
  return index >= tailStart ? BENTO_TAIL[total % 5][index - tailStart] : BENTO_BLOCK[index % 5];
}

// Editorial collage on desktop (lg+), repeating every five photos on a 12-column grid:
//   row A: [large portrait, cols 1-5] [small, cols 7-9, dropped low] [square, cols 10-12]
//   row B: [portrait, cols 2-5] [wide landscape, cols 7-12, dropped]
// The explicit column starts push tiles 4 and 1 onto new rows, so any number of photos lays out
// without holes. `drift` is how far each tile floats against the scroll (data-drift, wide screens
// only); mixed directions and strengths give the layered collage feel.
const COLLAGE: Array<{ tile: string; drift: number }> = [
  { tile: "lg:col-start-1 lg:col-span-5 lg:aspect-[4/5]", drift: 4 },
  { tile: "lg:col-start-7 lg:col-span-3 lg:mt-40 lg:aspect-[3/4]", drift: -7 },
  { tile: "lg:col-start-10 lg:col-span-3 lg:mt-12 lg:aspect-[2/3]", drift: 6 },
  { tile: "lg:col-start-2 lg:col-span-4 lg:aspect-[3/4]", drift: -5 },
  { tile: "lg:col-start-7 lg:col-span-6 lg:mt-12 lg:aspect-[3/2]", drift: 7 },
];

const nameFixes: Record<string, string> = {
  "Mr. Dave Malabanan": "Mr. David Andrew Malabanan",
  "Mr. Chona Fajardo": "Ms. Chona Fajardo",
  "Ralph Russel Ballesteros": "Mr. Ralph Russel Ballesteros",
  "Niño Jericho Bonsol": "Mr. Niño Jericho Bonsol",
  "Bryan Andal": "Mr. Bryan Andal",
  "Francis Gerald Fajardo": "Mr. Francis Gerald Fajardo",
  "Ms Niña Kyla Lariza": "Ms. Niña Kyla Lariza",
};
function fixName(name: string) { return nameFixes[name] ?? name; }

function PairedNames({
  left,
  right,
  subtitle,
}: {
  left: NameGroup;
  right: NameGroup;
  subtitle?: string;
}) {
  const maxLen = Math.max(left.names.length, right.names.length);
  const pairs: [string, string][] = [];
  for (let i = 0; i < maxLen; i++) {
    pairs.push([left.names[i] ?? "", right.names[i] ?? ""]);
  }
  return (
    <div data-fade className="text-center">
      {right.title ? (
        <div className="grid grid-cols-2 gap-x-4 sm:gap-x-12">
          <h4 className="text-right text-sm font-medium uppercase tracking-[0.2em] text-accent-ink sm:text-base">{left.title}</h4>
          <h4 className="text-left text-sm font-medium uppercase tracking-[0.2em] text-accent-ink sm:text-base">{right.title}</h4>
        </div>
      ) : (
        <h4 className="text-sm font-medium uppercase tracking-[0.2em] text-accent-ink sm:text-base">{left.title}</h4>
      )}
      {subtitle && (
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-lg">{subtitle}</p>
      )}
      <ul className="mx-auto mt-6 grid max-w-5xl grid-cols-2 gap-x-4 gap-y-2 sm:gap-x-12">
        {pairs.map(([l, r], i) => (
          <Fragment key={i}>
            <li className="py-1.5 text-right font-sans text-sm leading-snug tracking-[0.02em] sm:text-lg sm:tracking-[0.06em]">{fixName(l)}</li>
            <li className="py-1.5 text-left font-sans text-sm leading-snug tracking-[0.02em] sm:text-lg sm:tracking-[0.06em]">{fixName(r)}</li>
          </Fragment>
        ))}
      </ul>
    </div>
  );
}

function Names({
  group,
  className,
  formalNames = false,
  compactNames = false,
  subtitle,
}: {
  group: NameGroup;
  className?: string;
  formalNames?: boolean;
  compactNames?: boolean;
  subtitle?: string;
}) {
  return (
    <div data-fade className={className}>
      <h4 className="text-sm font-medium uppercase tracking-[0.2em] text-accent-ink sm:text-base">{group.title}</h4>
      {subtitle && (
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-lg">{subtitle}</p>
      )}
      <ul className="mt-4 space-y-1.5">
        {group.names.map((name, i) => (
          <li
            key={`${name}-${i}`}
            className={
              compactNames
                ? "font-sans text-sm leading-snug tracking-[0.02em] sm:text-lg sm:tracking-[0.06em]"
                : formalNames
                  ? "font-sans text-lg leading-snug tracking-[0.06em] sm:text-xl"
                  : "font-sans text-2xl leading-snug"
            }
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Invitation({
  wedding,
  text,
  entourage,
  details,
  guest,
  rsvpOpen,
  wishes,
}: {
  wedding: Wedding;
  text: PageText & { photos: PagePhotos; chapters: StoryChapter[] };
  entourage: Entourage;
  details: Details & { dressCodePhoto: GalleryPhoto | null; galleryPhotos: GalleryPhoto[] };
  guest: Guest;
  rsvpOpen: boolean;
  wishes: Wish[];
}) {
  const { hero, sections, story, photos, chapters } = text;
  const { dressCode, faq, gallery, galleryPhotos } = details;
  const hasEntourage = entourage.parents.length + entourage.sponsors.names.length + entourage.entourage.length > 0;
  const bestMan = entourage.entourage.find((group) => /^best man$/i.test(group.title));
  const maidOfHonor = entourage.entourage.find((group) => /^maid of honou?r$/i.test(group.title));
  const groomsmen = entourage.entourage.find((group) => /^groomsmen$/i.test(group.title));
  const bridesmaids = entourage.entourage.find((group) => /^bridesmaids?$/i.test(group.title));
  const veilSponsors = entourage.entourage.find((group) => /^to clothe us as one/i.test(group.title));
  const cordSponsors = entourage.entourage.find((group) => /^to bind us together/i.test(group.title));
  const candleSponsors = entourage.entourage.find((group) => /^to light our path/i.test(group.title));
  const otherEntourage = entourage.entourage.filter(
    (group) =>
      group !== bestMan &&
      group !== maidOfHonor &&
      group !== groomsmen &&
      group !== bridesmaids &&
      group !== veilSponsors &&
      group !== cordSponsors &&
      group !== candleSponsors,
  );
  let section = 0;

  return (
    <InvitationMotion
      scope={themeScopeProps()}
      // Gold dust behind every burgundy section; sections with their own background (story, details) cover it
      backdrop={<HeroParticles fixed haze={false} bandShare={0} count={260} />}
      cover={
        <div className="relative isolate flex h-svh w-full flex-col items-center justify-center overflow-hidden px-6 text-center text-[#f6eee3]">
          {/* Textured maroon behind the cover */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center" aria-hidden="true" style={{ backgroundImage: "url(/images/cover-bg-maroon.jpg)" }} />
          <p className="font-script text-4xl text-[#d4ae62] sm:text-5xl">You are invited!</p>
          <button
            data-cover-open
            type="button"
            className="group mt-5 flex w-full flex-col items-center gap-2 rounded-xl p-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4ae62]"
            aria-label="Open the wedding invitation"
          >
            {/* Envelope beats like a heart while hovered or pressed */}
            <style>{`@keyframes envelope-beat { 0%, 100% { transform: scale(1); } 40% { transform: scale(1.08); } }
            @media (prefers-reduced-motion: no-preference) { .envelope-beat:hover, .group:focus-visible .envelope-beat { animation: envelope-beat 0.7s ease-in-out 1; } .group[data-beating] .envelope-beat { animation: envelope-beat-once 1s ease-in-out 1; } }
            @keyframes envelope-beat-once { 0%, 100% { transform: scale(1); } 40% { transform: scale(1.1); } }`}</style>
            {/* Floral medallion with the envelope on top of it */}
            <span aria-hidden className="relative my-6 block" style={{ width: "min(26rem, 92vw)", aspectRatio: "717 / 703" }}>
            <Image src="/images/cover-medallion-v7.png" alt="" fill priority unoptimized className="pointer-events-none object-contain" style={{ filter: "drop-shadow(0 3px 3px rgba(15, 0, 3, 0.8)) drop-shadow(0 14px 18px rgba(15, 0, 3, 0.7))" }} />
            <span className="envelope-beat absolute block drop-shadow-2xl" style={{ left: "19%", top: "-11.5%", width: "62%", aspectRatio: "375 / 666" }}>
              {/* Couple photo where the letter paper was; the envelope (paper keyed out) sits on top */}
              <span className="absolute overflow-hidden" style={{ left: "23%", top: "37.5%", width: "54.5%", height: "21.5%" }}>
                <Image src="/images/cover-envelope-photo-v2.jpg" alt="" fill priority unoptimized className="object-cover" style={{ objectPosition: "55% 47%" }} />
              </span>
              <Image src="/images/cover-envelope-open-v2.png" alt="" fill priority unoptimized sizes="20rem" className="object-contain" />
            </span>
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-[#d4ae62] transition-colors group-hover:text-[#f6eee3]">Tap to open your invitation</span>
          </button>
        </div>
      }
    >
      <main>
        {/* Hero: gold monogram and invitation text above the couple portrait */}
        <section
          id="top"
          data-hero
          data-has-photo=""
          className="relative isolate flex min-h-svh flex-col overflow-hidden bg-background px-6 pb-22 pt-16 md:px-12 md:pt-20"
        >
          {/* Gold dust, drawn live in WebGL; the photo is the fallback (no JS, reduced motion, no WebGL) */}
          <HeroParticles
            fallback={
              <Image
                src="/images/hero-particles-v1.jpg"
                alt=""
                fill
                className="pointer-events-none object-cover opacity-40 mix-blend-screen"
              />
            }
          />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div
              data-fade
              role="img"
              aria-label={`${wedding.partner1.charAt(0)} and ${wedding.partner2.charAt(0)} monogram`}
              className="mx-auto"
            >
              <Image
                src="/images/monogram-metallic.png"
                alt=""
                width={291}
                height={240}
                priority
                unoptimized
                className="mx-auto h-auto w-[min(10rem,50vw)]"
              />
            </div>
            <p data-fade="0.12" className="mt-5 whitespace-nowrap text-[clamp(1.5rem,3.5vw,2.5rem)] leading-none tracking-[0.06em] text-[#f6eee3]" style={{ fontFamily: "var(--ff-new-icon)" }}>
              Lorenz <span className="text-[#d4ae62]">{hero.ampersand}</span> Jenzell
            </p>
            <p data-fade="0.24" className="mt-2 text-sm font-bold uppercase tracking-[0.35em] text-[#d4b5ae] md:text-base">01. 17. 27</p>
          </div>
          <div data-hero-stage className="relative z-10 -mt-6 flex min-h-[min(80svh,48rem)] flex-1 items-end justify-center">
            <div data-hero-photo className="absolute inset-0 flex translate-y-10 pt-10 items-center justify-center">
              <div data-reveal className="relative h-[calc(min(90svh,62rem)-5px)] aspect-square w-auto max-w-[110vw] sm:max-w-[95vw] md:max-w-[50rem]">
                <Image
                  src="/images/couple-hero-v2.png"
                  alt="Lorenz and Jenzell"
                  fill
                  priority
                  sizes="(min-width: 768px) 50rem, 110vw"
                  className="object-contain object-[34%_50%]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our story, then numbered chapters with alternating photos */}
        {/* Our story */}
        {/* Light beige band: re-scopes the theme tokens so text stays readable on the light background */}
        <section
          id="story"
          className="relative isolate scroll-mt-24 overflow-hidden bg-background px-6 py-24 text-foreground md:px-12 md:py-36"
          style={
            {
              "--background": "#f5eee4",
              "--foreground": "#5c0f1f",
              "--muted": "#7a4650",
              "--accent-ink": "#8a6516",
              "--line": "rgb(212 174 98 / 0.5)",
            } as React.CSSProperties
          }
        >
          {/* Blue flowers along the top, soft like the venues frame: one copy (no repeat) spanning the width,
              anchored to the top so only its upper garland shows; faint, desaturated and multiplied onto the
              beige, fading out before the text */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[length:100%_auto] bg-no-repeat opacity-20 mix-blend-multiply"
            style={{
              backgroundImage: "url(/images/story-flowers-top.webp)",
              // Shifted up (in vw, since the image scales with the width) so the flowers sit along the top edge
              backgroundPosition: "center -22vw",
              filter: "saturate(0.55) sepia(0.15) blur(1px)",
              maskImage: "linear-gradient(to bottom, black 20%, transparent 55%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 55%)",
            }}
          />
          <div className="flex flex-col items-center text-center">
            <div data-fade data-hero-greeting className="mx-auto max-w-3xl text-center text-lg leading-snug">
              <p className="mb-4 font-script text-[clamp(3rem,7vw,5.5rem)] leading-[1.1]">
                {fill(hero.greeting, { name: guest.name })}
              </p>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-ink md:text-base">{hero.intro}</p>
              <SongPlayerControls />
              <div data-fade className="mx-auto mt-8 max-w-xl space-y-4 text-center text-sm font-medium leading-relaxed text-muted sm:text-lg">
                <p>As we begin this next chapter together, we want to surround ourselves with the people who mean the most to us. You have been a cherished part of our journey, and we would be honored to have you by our side on our wedding day.</p>
                <p>Browse through the site to find event details, location guides, and RSVP information.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Countdown + Celebration photo combined */}
        <section id="celebration" aria-label={text.nav.celebration} className="relative isolate flex h-svh scroll-mt-16 flex-col overflow-hidden bg-[#35090d]">
          <Image
            src="/images/celebration-feature.jpg"
            alt="Lorenz and Jenzell on the crescent-moon bridge"
            fill
            unoptimized
            sizes="100vw"
            data-parallax
            className="object-cover scale-110"
            style={{ objectPosition: "55% 30%", filter: "saturate(0.7) brightness(1.15) contrast(0.9) blur(0.5px)" }}
          />
          {/* Warm overlay to blend blue sky with beige */}
          <div className="pointer-events-none absolute inset-0 z-[1] mix-blend-multiply" style={{ backgroundColor: "rgba(200, 173, 127, 0.45)" }} />
          {/* Beige glow from top */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-40" style={{ boxShadow: "0 0 120px 80px #f2e9dc", backgroundColor: "#f2e9dc" }} />
          <div className="relative z-10 flex items-center justify-center px-6 py-10" style={{ backgroundColor: "#f2e9dc" }}>
            <div data-fade className="text-center">
              <Countdown date={wedding.date} labels={text.countdown} />
            </div>
          </div>
          <div className="flex-1" />
        </section>

        {/* Entourage through to the Moments gallery share one glitter layer, so it falls continuously
            from behind the photo above down to the end of the page. It scrolls with the page; the wrapper clips
            its source, which sits above the wrapper's top edge. The beige venues section covers it. */}
        <div className="relative isolate overflow-hidden">
        <GlitterCascade
          windowed
          density={170}
          glints={7}
          speed={55}
          advanced={{ flakeSize: 2.4, glintArm: 24, glintHalo: 8, shimmer: 15, fallSpread: 40 }}
          className="pointer-events-none absolute inset-x-0 -top-44 bottom-0 -z-10"
          style={{
            maskImage: "linear-gradient(to bottom, black 94%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black 94%, transparent)",
          }}
        />

        {/* Family & entourage */}
        {hasEntourage && (
          <section id="entourage" className="relative isolate scroll-mt-24 overflow-hidden px-6 py-24 md:px-12 md:py-36">
            <div className="mt-16 flex flex-col items-center text-center">
              <h2 data-fade className="text-center text-[clamp(3rem,7vw,6.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
                {entourage.title.toLowerCase()}
              </h2>
              {entourage.intro && (
                <p data-fade className="mt-8 max-w-xl text-sm leading-relaxed text-muted sm:text-lg">
                  {entourage.intro}
                </p>
              )}
            </div>
            {entourage.parents.length >= 2 && (
              <div className="mx-auto mt-20 max-w-5xl border-t-2 border-line pt-12">
                <PairedNames left={entourage.parents[0]} right={entourage.parents[1]} />
              </div>
            )}
            {entourage.parents.length === 1 && (
              <div className="mx-auto mt-20 max-w-2xl border-t-2 border-line pt-12">
                <Names group={entourage.parents[0]} className="text-center" compactNames />
              </div>
            )}
            {entourage.sponsors.names.length > 0 && (
              <div data-fade className="mt-20 border-t-2 border-line pt-12 text-center">
                <p className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-muted sm:text-lg">
                  To guide and support us with wisdom and love
                </p>
                <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-accent-ink sm:text-base">{entourage.sponsors.title}</h3>
                <ul className="mx-auto mt-6 grid max-w-5xl grid-cols-2 gap-x-4 gap-y-2 sm:gap-x-12">
                  {(() => {
                    const names = [...entourage.sponsors.names];
                    const rightKeys = ["chona", "christian", "dennis", "michael", "danny", "eduardo", "aristotle"];
                    const remaining = [...names];
                    const right: string[] = [];
                    const left: string[] = [];
                    for (const key of rightKeys) {
                      const idx = remaining.findIndex(n => n.toLowerCase().includes(key));
                      if (idx >= 0) right.push(remaining.splice(idx, 1)[0]);
                    }
                    left.push(...remaining);
                    const merged: string[] = [];
                    for (let i = 0; i < Math.max(left.length, right.length); i++) {
                      if (left[i]) merged.push(left[i]);
                      if (right[i]) merged.push(right[i]);
                    }
                    return merged;
                  })().map((name, i) => {
                    const display = fixName(name);
                    return (
                    <li
                      key={`${name}-${i}`}
                      className={`py-1.5 text-center font-sans text-sm leading-snug tracking-[0.02em] sm:text-lg sm:tracking-[0.06em] ${i % 2 === 0 ? "text-right" : "text-left"}`}
                    >
                      {display}
                    </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <div data-fade className="mt-20 border-t-2 border-line pt-12 text-center">
              <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted sm:text-lg">
                To stand as our closest witness and steadfast support
              </p>
            </div>
            {bestMan && maidOfHonor && (
              <div className="mx-auto mt-10 max-w-5xl">
                <PairedNames left={bestMan} right={maidOfHonor} />
              </div>
            )}
            {((groomsmen && bridesmaids) || otherEntourage.length > 0) && (
              <div data-fade className="mt-20 border-t-2 border-line pt-12 text-center">
                <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted sm:text-lg">
                  To walk with us in joy, friendship, and celebration
                </p>
              </div>
            )}
            {groomsmen && bridesmaids && (
              <div className="mx-auto mt-10 max-w-5xl">
                <PairedNames left={groomsmen} right={bridesmaids} />
              </div>
            )}
            {veilSponsors && (
              <div className="mx-auto mt-16 max-w-5xl">
                <PairedNames
                  left={{ title: veilSponsors.title, names: veilSponsors.names.filter((_, i) => i % 2 === 0) }}
                  right={{ title: "", names: veilSponsors.names.filter((_, i) => i % 2 === 1) }}
                />
              </div>
            )}
            {cordSponsors && (
              <div className="mx-auto mt-10 max-w-5xl">
                <PairedNames
                  left={{ title: cordSponsors.title, names: cordSponsors.names.filter((_, i) => i % 2 === 0) }}
                  right={{ title: "", names: cordSponsors.names.filter((_, i) => i % 2 === 1) }}
                />
              </div>
            )}
            {candleSponsors && (
              <div className="mx-auto mt-10 max-w-5xl">
                <PairedNames
                  left={{ title: candleSponsors.title, names: candleSponsors.names.filter((_, i) => i % 2 === 0) }}
                  right={{ title: "", names: candleSponsors.names.filter((_, i) => i % 2 === 1) }}
                />
              </div>
            )}
            {otherEntourage.length > 0 && (
              <>
                <div data-fade className="mt-20 border-t-2 border-line pt-12" />
                {otherEntourage.map((group) => {
                  const subtitle: Record<string, string> = {
                    "ring bearer": "To carry the symbol of our eternal love",
                    "bible bearer": "To carry the word of God that guides our union",
                    "coin bearer": "To present the symbol of shared prosperity",
                    "flower girls": "To scatter flowers on our way",
                    "here comes the bride banner": "To pave the way for the bride",
                  };
                  const desc = subtitle[group.title.trim().toLowerCase()];
                  return (
                    <div key={group.title} className="mx-auto mt-10 max-w-2xl text-center">
                      <Names group={group} className="text-center" compactNames subtitle={desc} />
                    </div>
                  );
                })}
              </>
            )}
          </section>
        )}

        {/* Custom section */}
        {(text.customSection.title || text.customSection.body) && (
          <section className="scroll-mt-24 px-6 py-24 text-center md:px-12 md:py-36">
            {text.customSection.title && (
              <h2 data-fade className="text-center text-[clamp(3rem,7vw,6.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
                {text.customSection.title.toLowerCase()}
              </h2>
            )}
            {text.customSection.body && (
              <p data-fade className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-muted sm:text-lg">
                {text.customSection.body}
              </p>
            )}
          </section>
        )}

        {/* Dress code */}
        {(dressCode.title || dressCode.description || dressCode.palette.length > 0) && (
          <section id="details" className="relative isolate scroll-mt-24 overflow-hidden bg-[#e8ddd0] px-6 pt-16 pb-24 text-[#3b0d18] md:px-12 md:pt-24 md:pb-36">
            {/* Watercolour floral frame, faint: multiply drops the white paper so only the flowers tint the
                beige; desaturated and blurred a touch so the blue sits softly with the burgundy and gold */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-20 mix-blend-multiply"
              style={{ backgroundImage: "url(/images/venues-frame.jpg)", filter: "saturate(0.55) sepia(0.15) blur(1px)" }}
            />
            {/* Soft burgundy glow from the corners, where the flowers are, fading to clear beige in the middle */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 60% 45% at 0% 0%, rgba(122,28,46,0.14), transparent 70%), radial-gradient(ellipse 60% 45% at 100% 0%, rgba(122,28,46,0.12), transparent 70%), radial-gradient(ellipse 60% 45% at 0% 100%, rgba(122,28,46,0.12), transparent 70%), radial-gradient(ellipse 60% 45% at 100% 100%, rgba(122,28,46,0.14), transparent 70%)",
              }}
            />
            <div className="mt-16 grid gap-12 md:grid-cols-12">
              <div className={details.dressCodePhoto ? "md:col-span-7" : "md:col-span-12"}>
                <h2 data-fade className="text-center text-[clamp(3rem,7vw,6.5rem)] capitalize leading-[1.3] text-[#9a7420]" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.45), 0 0 20px rgba(201,168,76,0.25)" }}>
                  {dressCode.title.toLowerCase()}
                </h2>
                <div data-fade className="mx-auto mt-10 flex justify-center">
                  <Image src="/images/venue-church.png" alt="Our Mother of Perpetual Help Parish" width={600} height={400} className="w-full sm:max-w-md sm:mx-auto" style={{ filter: "brightness(0) saturate(100%) invert(8%) sepia(40%) saturate(3000%) hue-rotate(330deg) brightness(80%) contrast(200%) drop-shadow(0 0 0.5px #3b0d18) drop-shadow(0 0 0.5px #3b0d18)" }} />
                </div>
                <div data-fade className="mt-8 text-center">
                  <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-[#3b0d18]">The Ceremony</h3>
                  <p className="mt-3 font-sans text-2xl leading-snug text-[#3b0d18]">Our Mother of Perpetual Help</p>
                  <p className="mt-2 font-sans text-sm text-[#3b0d18]/70 sm:text-lg">Poblacion, Agoncillo, Batangas</p>
                  <p className="mt-6 font-sans text-sm italic text-[#3b0d18]/70">Scan to locate</p>
                  <div className="mx-auto mt-3 w-32">
                    <Image src="/images/venue-qr-ceremony.png" alt="QR code to locate Our Mother of Perpetual Help Parish" width={200} height={200} className="w-full" />
                  </div>
                </div>
                <div data-fade className="mx-auto mt-10 flex justify-center">
                  <Image src="/images/venue-reception.png" alt="La Casa Eduardo Events" width={600} height={400} className="max-w-full" style={{ filter: "brightness(0) saturate(100%) invert(8%) sepia(40%) saturate(3000%) hue-rotate(330deg) brightness(80%) contrast(200%) drop-shadow(0 0 0.5px #3b0d18) drop-shadow(0 0 0.5px #3b0d18)" }} />
                </div>
                <div data-fade className="mt-8 text-center">
                  <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-[#3b0d18]">The Reception</h3>
                  <p className="mt-3 font-display text-2xl leading-snug text-[#3b0d18]">La Casa Eduardo&apos;s Event Center</p>
                  <p className="mt-2 font-sans text-sm italic text-[#3b0d18]/70 sm:text-lg">Halang, Taal, Batangas</p>
                  <p className="mt-6 font-sans text-sm italic text-[#3b0d18]/70">Scan to locate</p>
                  <div className="mx-auto mt-3 w-32">
                    <Image src="/images/venue-qr-reception.png" alt="QR code to locate La Casa Eduardo&apos;s Event Center" width={200} height={200} className="w-full" />
                  </div>
                </div>
                {dressCode.palette.length > 0 && (
                  <div className="mt-14">
                    {dressCode.note && <p data-fade className="mb-8 italic text-foreground/80">{dressCode.note}</p>}
                    <ul className="flex flex-wrap gap-8">
                      {dressCode.palette.map((c, i) => (
                        <li key={`${c.name}-${i}`} data-fade={String(i * 0.08)} className="flex flex-col items-center gap-3">
                          <span className="h-20 w-20 rounded-full ring-1 ring-line md:h-24 md:w-24" style={{ backgroundColor: c.color }} />
                          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">{c.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {details.dressCodePhoto && (
                <Photo photo={details.dressCodePhoto} sizes="(min-width: 768px) 35vw, 100vw" className="aspect-[4/5] w-full md:col-span-5" />
              )}
            </div>
          </section>
        )}

        {/* Schedule: vertical timeline */}
        <section id="schedule" className="relative scroll-mt-24 overflow-hidden px-10 py-28 sm:px-16 md:px-20 md:py-36">
          {/* Gold ornament borders */}
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
            <div className="absolute left-0 top-0 h-full w-5 sm:w-7" style={{ backgroundImage: "url(/images/gold-border-v.png)", backgroundRepeat: "repeat-y", backgroundSize: "100% auto" }} />
            <div className="absolute right-0 top-0 h-full w-5 sm:w-7" style={{ backgroundImage: "url(/images/gold-border-v.png)", backgroundRepeat: "repeat-y", backgroundSize: "100% auto", transform: "scaleX(-1)" }} />
            <div className="absolute left-0 top-0 h-5 w-full sm:h-7" style={{ backgroundImage: "url(/images/gold-border-h.png)", backgroundRepeat: "repeat-x", backgroundSize: "auto 100%" }} />
            <div className="absolute bottom-0 left-0 h-5 w-full sm:h-7" style={{ backgroundImage: "url(/images/gold-border-h.png)", backgroundRepeat: "repeat-x", backgroundSize: "auto 100%", transform: "scaleY(-1)" }} />
          </div>
          {/* Framed timeline */}
          <div className="relative z-10 mx-auto max-w-2xl px-4 py-8">
            <div className="px-6 py-8 sm:px-10 sm:py-12">
              <h2 data-fade className="text-center text-[clamp(2rem,5vw,3rem)] capitalize text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
                Wedding Timeline
              </h2>
              <div data-timeline className="relative mt-10">
                {/* Vertical line, with a gold fill that grows as the visitor scrolls (see data-timeline in InvitationMotion) */}
                <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-accent-ink/40">
                  <div data-timeline-fill className="h-full w-full origin-top bg-accent-ink" />
                </div>
                <ol className="relative space-y-10 sm:space-y-12">
                  {wedding.schedule.map((s, i) => (
                    <li
                      key={`${s.time}-${i}`}
                      data-fade
                      className={`flex items-center gap-4 sm:gap-6 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                    >
                      {/* Content */}
                      <div className={`w-[calc(50%-1.25rem)] sm:w-[calc(50%-1.5rem)] ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                        <span className="font-sans text-lg font-semibold leading-snug text-accent-ink sm:text-xl">{s.time}</span>
                        <p className="mt-1 font-sans text-xs uppercase tracking-[0.15em] text-muted sm:text-sm">{s.item}</p>
                      </div>
                      {/* Dot on the line */}
                      <div
                        data-timeline-dot
                        className="relative z-10 h-4 w-4 flex-shrink-0 rounded-full border-2 border-accent-ink bg-accent-ink shadow-[0_0_12px_rgba(212,174,98,0.7)] transition-[background-color,box-shadow] duration-500"
                      />
                      {/* Spacer for the other side */}
                      <div className="w-[calc(50%-1.25rem)] sm:w-[calc(50%-1.5rem)]" />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Attire */}
        <section className="scroll-mt-24 px-6 pt-16 pb-24 text-center md:px-12 md:pt-24 md:pb-36">
          <h2 data-fade className="text-center text-[clamp(3rem,7vw,6.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
            Attire Guide
          </h2>
          <p data-fade className="mt-24 font-script text-2xl italic text-accent-ink sm:text-3xl">Principal Sponsors</p>
          <p data-fade className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-accent-ink">Formal Attire</p>
          <p data-fade className="mt-4 text-sm leading-relaxed text-foreground sm:text-base"><span className="font-semibold">Ladies:</span> Long Gown in Beige</p>
          <p data-fade className="mt-2 text-sm leading-relaxed text-foreground sm:text-base"><span className="font-semibold">Gentlemen:</span> Americana Coat and Slacks, Beige Neck Tie and inner with White</p>
          <div data-fade className="mx-auto -mt-4 max-w-md">
            <Image src="/images/attire-sponsors-v7.png" alt="Principal sponsors attire guide" width={1084} height={980} className="w-full" />
          </div>
          <div data-fade className="mt-8 flex justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="h-8 w-8 rounded-full ring-1 ring-line" style={{ backgroundColor: "#C8AD7F" }} />
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">Beige</span>
            </div>
          </div>

          {/* Guest Attire */}
          <div data-fade className="mt-16 border-t-2 border-line pt-12" />
          <p data-fade className="mt-6 font-script text-2xl italic text-accent-ink sm:text-3xl">Wedding Guests</p>
          <p data-fade className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-accent-ink">Semi-Formal</p>
          <p data-fade className="mt-4 text-sm leading-relaxed text-foreground sm:text-base"><span className="font-semibold">Ladies:</span> Long Dress or Short Dress</p>
          <p data-fade className="mt-2 text-sm leading-relaxed text-foreground sm:text-base"><span className="font-semibold">Gentlemen:</span> Polo, Polo Shirt, or Long Sleeves</p>
          <div data-fade className="mx-auto mt-2 max-w-lg">
            <Image src="/images/attire-guests-v4.png" alt="Guest attire guide" width={475} height={213} className="w-full" />
          </div>
          <div data-fade className="mx-auto mt-8 grid max-w-xs grid-cols-3 justify-items-center gap-y-2">
            <span className="h-8 w-8 rounded-full ring-1 ring-line" style={{ backgroundColor: "#C8AD7F" }} />
            <span className="h-8 w-8 rounded-full ring-1 ring-line" style={{ backgroundColor: "#BFA98A" }} />
            <span className="h-8 w-8 rounded-full ring-1 ring-line" style={{ backgroundColor: "#F7E7CE" }} />
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">Beige</span>
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">Khaki</span>
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">Champagne</span>
          </div>
          <div data-fade className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-surface/50 px-5 py-4 text-left ring-1 ring-line">
              <p className="flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-accent-ink">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-ink text-xs text-background">✓</span>
                Do&apos;s
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                <li className="flex gap-2"><span className="mt-0.5 text-accent-ink">✓</span>Wear colors in beige, khaki, champagne and their variations.</li>
                <li className="flex gap-2"><span className="mt-0.5 text-accent-ink">✓</span>Choose appropriate semi-formal attire (dresses, polos, collared shirts, slacks).</li>
              </ul>
            </div>
            <div className="rounded-lg bg-surface/50 px-5 py-4 text-left ring-1 ring-line">
              <p className="flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-accent-ink">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-ink text-xs text-background">✕</span>
                Don&apos;ts
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                <li className="flex gap-2"><span className="mt-0.5 text-accent-ink">✓</span>Avoid black, white, and overly casual attire (e.g. T-shirts, shorts, jeans, sneakers).</li>
                <li className="flex gap-2"><span className="mt-0.5 text-accent-ink">★</span><em>Please reserve white for the bride.</em></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Reminders */}
        <section className="scroll-mt-24 px-6 py-24 text-center md:px-12 md:py-36">
          <div data-fade className="border-t-2 border-line pt-12" />
          <h2 data-fade className="text-center text-[clamp(3rem,7vw,6.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
            Reminders
          </h2>
          <div data-fade className="mx-auto mt-4 w-48">
            <Image src="/images/gold-ornament.png" alt="" width={450} height={106} className="w-full" aria-hidden="true" />
          </div>
          <h3 data-fade className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-accent-ink">Please Arrive Early</h3>
          <p data-fade className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted sm:text-base">To help everything to run smoothly, please arrive at least 30 minutes before the start of the ceremony.</p>
          <div data-fade className="mx-auto mt-4 w-48">
            <Image src="/images/gold-ornament.png" alt="" width={450} height={106} className="w-full" aria-hidden="true" />
          </div>
          <h3 data-fade className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-accent-ink">Celebrate With Us</h3>
          <p data-fade className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted sm:text-base">Bring your best energy, your brightest smile, and get ready to enjoy every part of this special day with us!</p>
          <div data-fade className="mx-auto mt-4 w-48">
            <Image src="/images/gold-ornament.png" alt="" width={450} height={106} className="w-full" aria-hidden="true" />
          </div>
          <h3 data-fade className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-accent-ink">Snap &amp; Share</h3>
          <p data-fade className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted sm:text-base">After the ceremony ends, feel free to take and post photos. Don&apos;t forget to tag your moments with us so we can enjoy them too!</p>
          <div data-fade className="mx-auto mt-4 w-48">
            <Image src="/images/gold-ornament.png" alt="" width={450} height={106} className="w-full" aria-hidden="true" />
          </div>
        </section>

        {/* Questions & answers: hidden for now (SHOW_FAQ); the content stays in the CMS for later */}
        {SHOW_FAQ && faq.items.length > 0 && (
          <section id="faq" className="scroll-mt-24 px-6 py-24 md:px-12 md:py-36">
            <SectionLabel index={++section}>{text.nav.faq}</SectionLabel>
            <div className="mt-16 grid gap-12 md:grid-cols-12">
              <div className="md:col-span-5">
                {faq.intro && <p data-fade className="text-xs font-medium uppercase tracking-[0.2em] text-accent-ink">{faq.intro}</p>}
                <h2 data-fade className="mt-6 text-[clamp(3rem,7vw,6.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
                  {faq.title.toLowerCase()}
                </h2>
              </div>
              <div className="md:col-span-7">
                {faq.items.map((item, i) => (
                  <details key={`${item.question}-${i}`} data-fade className="group border-t-2 border-line py-6 last:border-b">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-2xl leading-snug [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <span aria-hidden className="mt-1 text-accent-ink transition-transform duration-300 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-lg">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* RSVP */}
        <section id="rsvp" className="scroll-mt-24 px-6 py-24 md:px-12 md:py-36">
          <h2 data-fade className="mt-16 text-center text-[clamp(3rem,7vw,6.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
            {sections.rsvpTitle.toLowerCase()}
          </h2>
          {rsvpOpen && (
            <p data-fade className="mt-16 text-center text-lg text-muted">
              {fill(sections.respondBy, { date: wedding.rsvpBy })}
            </p>
          )}
          <div className="mx-auto mt-16 max-w-xl">
            <RsvpForm guest={guest} open={rsvpOpen} labels={text.rsvpForm} messages={text.rsvpMessages} />
          </div>
        </section>

        {/* Gallery: scrolls sideways on desktop, photos turn from black-and-white to colour */}
        {galleryPhotos.length > 0 && (
          <section id="gallery" className="scroll-mt-24 overflow-hidden py-24 md:py-36">
            <div className="px-6 md:px-12">
              {/* Centred on phones; title left and intro right from md up */}
              <div className="mt-12 flex flex-col items-center gap-6 text-center md:flex-row md:flex-wrap md:items-end md:justify-between md:text-left">
                <h2 data-fade className="text-[clamp(3rem,7vw,6.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
                  {gallery.title.toLowerCase()}
                </h2>
                {gallery.intro && <p data-fade className="max-w-sm text-lg text-muted">{gallery.intro}</p>}
              </div>
            </div>
            {/* Phones: bento grid. Tablets: 3 columns. Desktop: drifting editorial collage (COLLAGE). */}
            <div className="mt-12 grid grid-cols-2 gap-2 px-6 max-md:auto-rows-[8.5rem] max-md:grid-flow-dense md:grid-cols-3 md:gap-4 md:px-12 lg:mt-20 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-28 lg:px-16 xl:px-24">
              {galleryPhotos.map((p, i) => {
                const collage = COLLAGE[i % COLLAGE.length];
                return (
                  <figure
                    key={`${p.url}-${i}`}
                    data-drift={collage.drift}
                    className={`overflow-hidden lg:self-start lg:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] lg:ring-1 lg:ring-line ${bentoTile(i, galleryPhotos.length)} ${collage.tile}`}
                  >
                    <Image
                      data-colorize
                      src={p.url}
                      alt={p.alt}
                      width={p.width}
                      height={p.height}
                      sizes="(min-width: 1024px) 45vw, 50vw"
                      className="h-full w-full object-cover grayscale"
                      style={{ objectPosition: focalPosition(p) }}
                    />
                  </figure>
                );
              })}
            </div>
          </section>
        )}

        {/* Well wishes: guests leave a message everyone can read (one per guest, newest first) */}
        <section id="wishes" className="scroll-mt-24 px-6 py-24 md:px-12 md:py-36">
          <div className="mt-24 flex flex-col items-center gap-6 text-center">
            <h2 data-fade className="text-[clamp(3rem,7vw,6.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
              {text.wishes.title.toLowerCase()}
            </h2>
            {text.wishes.intro && <p data-fade className="max-w-xl text-lg text-muted">{text.wishes.intro}</p>}
          </div>
          <div data-fade className="mt-12">
            <WishesForm
              guest={guest}
              existing={wishes.find((w) => w.guest_id === guest.id)?.message ?? null}
              maxLength={MAX_WISH_LENGTH}
              text={text.wishes}
            />
          </div>
          {/* No data-fade here: this list changes after a post (router.refresh), and the motion layer only
              animates elements present at load, so faded items added later would stay hidden */}
          {wishes.length === 0 ? (
            <p className="mt-16 text-center text-sm italic text-muted">{text.wishes.empty}</p>
          ) : (
            <ul className="mx-auto mt-16 max-w-2xl divide-y divide-line border-y border-line text-left">
              {wishes.map((w) => (
                <li key={w.id} className="py-6">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="font-semibold text-accent-ink">{w.name}</p>
                    <time dateTime={w.created_at} className="text-xs text-muted">
                      {formatWishTime(w.created_at)}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-base leading-relaxed">{w.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
        </div>

      </main>
    </InvitationMotion>
  );
}