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

// Every name in the entourage section uses this one size (the Bible Bearer style)
const NAME_CLASS = "font-(family-name:--ff-inria-serif) text-sm leading-snug tracking-[0.02em] sm:text-lg sm:tracking-[0.06em]";

// One centred column: optional title, then the names
function Names({ group, className }: { group: NameGroup; className?: string }) {
  return (
    <div data-fade className={className}>
      {group.title && (
        <h4 className="font-(family-name:--ff-inria-serif) text-sm font-medium uppercase tracking-[0.2em] text-accent-ink sm:text-base">{group.title}</h4>
      )}
      <ul className={`${group.title ? "mt-4 " : ""}space-y-1.5`}>
        {group.names.map((name, i) => (
          <li key={`${name}-${i}`} className={NAME_CLASS}>
            {fixName(name)}
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
  details: Details & { dressCodePhoto: GalleryPhoto | null; galleryPhotos: GalleryPhoto[]; galleryBanners: GalleryPhoto[] };
  guest: Guest;
  rsvpOpen: boolean;
  wishes: Wish[];
}) {
  const { hero, sections, story, photos, chapters } = text;
  const { dressCode, faq, gallery, galleryPhotos, galleryBanners } = details;
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
          <p data-cover-fade className="font-script text-[clamp(3rem,7vw,6.5rem)] leading-[1.3] text-accent-ink lg:mt-10" style={{ textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>{text.cover.title}</p>
          <button
            data-cover-open
            type="button"
            className="group mt-5 flex w-full flex-col items-center gap-2 rounded-xl p-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4ae62]"
            aria-label="Open the wedding invitation"
          >
            {/* Envelope beats like a heart while hovered or pressed */}
            <style>{`@keyframes envelope-beat { 0%, 100% { transform: scale(1); } 40% { transform: scale(1.08); } }
            .group:not([data-opening]) .envelope-beat:hover, .group:not([data-opening]):focus-visible .envelope-beat { animation: envelope-beat 0.7s ease-in-out 1; }`}</style>
            {/* Gilded oval frame with roses, with the envelope in the middle of the oval; sized to fit the screen height beside the title and caption (on computers it leaves room for the space above the title) */}
            <span aria-hidden className="relative my-4 block w-[min(24rem,84vw,calc((100svh_-_13rem)*1200/1491))] lg:w-[min(40rem,calc((100svh_-_15.5rem)*1200/1491))]" style={{ aspectRatio: "1200 / 1491" }}>
              <Image src="/images/cover-frame-v1.webp" alt="" fill priority unoptimized className="pointer-events-none object-contain" style={{ filter: "drop-shadow(0 14px 18px rgba(15, 0, 3, 0.6))" }} />
              {/* Only the envelope zooms when tapped, before the flash; the frame stays put (InvitationMotion, data-cover-envelope) */}
              <span data-cover-envelope className="envelope-beat absolute block drop-shadow-2xl" style={{ left: "21%", top: "6.2%", width: "60%", aspectRatio: "375 / 666" }}>
                {/* Couple photo where the letter paper was; the envelope (paper keyed out) sits on top */}
                <span className="absolute overflow-hidden" style={{ left: "23%", top: "37.5%", width: "54.5%", height: "21.5%" }}>
                  {text.photos.cover ? (
                    <Image src={text.photos.cover.url} alt="" fill priority sizes="12rem" className="object-cover" style={{ objectPosition: focalPosition(text.photos.cover) }} />
                  ) : (
                    <Image src="/images/cover-envelope-photo-v2.jpg" alt="" fill priority unoptimized className="object-cover" style={{ objectPosition: "55% 47%" }} />
                  )}
                </span>
                <Image src="/images/cover-envelope-open-v2.png" alt="" fill priority unoptimized sizes="20rem" className="object-contain" />
              </span>
            </span>
            <span data-cover-fade className="text-xs font-medium uppercase tracking-[0.3em] text-[#d4ae62] transition-colors group-hover:text-[#f6eee3]">Tap to open your invitation</span>
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
              data-intro="mark"
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
            <p data-intro="type" className="mt-5 whitespace-nowrap text-[clamp(2rem,8vw,4rem)] leading-none tracking-[0.06em] text-[#f6eee3]" style={{ fontFamily: "var(--ff-new-icon)" }}>
              Lorenz <span className="text-[#d4ae62]">{hero.ampersand}</span> Jenzell
            </p>
            <p data-intro="type" className="mt-2 whitespace-nowrap text-sm font-bold uppercase tracking-[0.35em] text-[#d4b5ae] md:text-base">01. 17. 27</p>
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
          {/* White marble, like the venues section */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center"
            style={{ backgroundImage: "url(/images/marble-bg-v1.jpg)" }}
          />
          <div className="flex flex-col items-center text-center">
            <div data-fade data-hero-greeting className="mx-auto max-w-3xl text-center text-lg leading-snug">
              <p className="mb-4 font-script text-[clamp(3rem,7vw,5.5rem)] leading-[1.1]">
                {fill(hero.greeting, { name: guest.name })}
              </p>
              <p className="font-(family-name:--ff-inria-serif) text-sm font-semibold uppercase tracking-[0.2em] text-accent-ink md:text-base">{hero.intro}</p>
              <SongPlayerControls />
              <div data-fade className="font-(family-name:--ff-inria-serif) mx-auto mt-8 max-w-xl space-y-4 text-center text-sm font-medium leading-relaxed text-muted sm:text-lg">
                <p>As we begin this next chapter together, we want to surround ourselves with the people who mean the most to us. You have been a cherished part of our journey, and we would be honored to have you by our side on our wedding day.</p>              </div>
            </div>
          </div>
        </section>

        {/* Countdown + Celebration photo combined */}
        <section id="celebration" aria-label={text.nav.celebration} className="relative isolate flex h-svh scroll-mt-16 flex-col overflow-hidden bg-[#35090d]">
          {text.photos.banner ? (
            <Image
              src={text.photos.banner.url}
              alt={text.photos.banner.alt}
              fill
              sizes="100vw"
              data-parallax
              className="object-cover scale-110"
              style={{ objectPosition: focalPosition(text.photos.banner), filter: "saturate(0.7) brightness(1.15) contrast(0.9) blur(0.5px)" }}
            />
          ) : (
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
          )}
          {/* Warm overlay to blend blue sky with beige */}
          <div className="pointer-events-none absolute inset-0 z-[1] mix-blend-multiply" style={{ backgroundColor: "rgba(200, 173, 127, 0.45)" }} />
          {/* Burgundy glow from the bottom, blending the photo into the countdown band */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-40" style={{ boxShadow: "0 0 120px 80px #35090d", backgroundColor: "#35090d" }} />
          <div className="flex-1" />
          <div className="relative z-10 flex items-center justify-center px-6 py-10" style={{ backgroundColor: "#35090d" }}>
            <div data-fade className="text-center">
              <Countdown date={wedding.date} labels={text.countdown} />
            </div>
          </div>
        </section>

        {/* Dress code */}
        {(dressCode.title || dressCode.description || dressCode.palette.length > 0) && (
          <section id="details" className="relative isolate scroll-mt-24 overflow-hidden bg-[#e8ddd0] px-6 pt-16 pb-24 text-[#3b0d18] md:px-12 md:pt-24 md:pb-36">
            {/* White marble background */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center"
              style={{ backgroundImage: "url(/images/marble-bg-v1.jpg)" }}
            />
            {/* Soft burgundy glow from the corners, fading to clear beige in the middle */}
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
                <h2 data-fade className="text-center text-[clamp(3rem,7vw,6.5rem)] capitalize leading-[1.3] text-[#3b0d18]" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.45), 0 0 20px rgba(201,168,76,0.25)" }}>
                  {dressCode.title.toLowerCase()}
                </h2>
                <div data-fade className="mx-auto mt-10 flex justify-center">
                  <Image src="/images/venue-church.png" alt="Our Mother of Perpetual Help Parish" width={600} height={400} className="w-full sm:max-w-md sm:mx-auto" style={{ filter: "brightness(0) saturate(100%) invert(8%) sepia(40%) saturate(3000%) hue-rotate(330deg) brightness(80%) contrast(200%) drop-shadow(0 0 0.5px #3b0d18) drop-shadow(0 0 0.5px #3b0d18)" }} />
                </div>
                <div data-fade className="mt-8 text-center">
                  <h3 className="font-(family-name:--ff-inria-serif) text-sm font-medium uppercase tracking-[0.2em] text-[#3b0d18]">The Ceremony</h3>
                  <p className="font-(family-name:--ff-inria-serif) mt-3 text-2xl leading-snug text-[#3b0d18]"><a href="https://www.google.com/maps/search/?api=1&query=13.935823%2C120.928066" target="_blank" rel="noopener noreferrer" className="underline decoration-[#3b0d18]/30 underline-offset-4">Our Mother of Perpetual Help</a></p>
                  <p className="font-(family-name:--ff-inria-serif) mt-2 text-sm text-[#3b0d18]/70 sm:text-lg">Poblacion, Agoncillo, Batangas</p>
                  <p className="mt-6 font-sans text-sm italic text-[#3b0d18]/70">Scan to locate</p>
                  <div className="mx-auto mt-3" style={{ width: "110px" }}>
                    <Image src="/images/venue-qr-ceremony-v8.png" alt="QR code to locate Our Mother of Perpetual Help Parish" width={1000} height={1000} className="w-full" />
                  </div>
                </div>
                <div data-fade className="mx-auto mt-10 flex justify-center">
                  <Image src="/images/venue-reception.png" alt="La Casa Eduardo Events" width={600} height={400} className="max-w-full" style={{ filter: "brightness(0) saturate(100%) invert(8%) sepia(40%) saturate(3000%) hue-rotate(330deg) brightness(80%) contrast(200%) drop-shadow(0 0 0.5px #3b0d18) drop-shadow(0 0 0.5px #3b0d18)" }} />
                </div>
                <div data-fade className="mt-8 text-center">
                  <h3 className="font-(family-name:--ff-inria-serif) text-sm font-medium uppercase tracking-[0.2em] text-[#3b0d18]">The Reception</h3>
                  <p className="font-(family-name:--ff-inria-serif) mt-3 text-2xl leading-snug text-[#3b0d18]"><a href="https://maps.google.com/maps/place//data=!4m2!3m1!1s0x33bd0b003448d9b1:0x5615d1d65f175ebc?hl=en" target="_blank" rel="noopener noreferrer" className="underline decoration-[#3b0d18]/30 underline-offset-4">La Casa Eduardo&apos;s Event Center</a></p>
                  <p className="font-(family-name:--ff-inria-serif) mt-2 text-sm text-[#3b0d18]/70 sm:text-lg">Halang, Taal, Batangas</p>
                  <p className="mt-6 font-sans text-sm italic text-[#3b0d18]/70">Scan to locate</p>
                  <div className="mx-auto mt-3" style={{ width: "110px" }}>
                    <Image src="/images/venue-qr-reception-v4.png" alt="QR code to locate La Casa Eduardo&apos;s Event Center" width={1000} height={1000} className="w-full" />
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

        {/* Entourage through to the Moments gallery share one glitter layer, so it falls continuously
            from behind the photo above down to the end of the page. It scrolls with the page; the wrapper clips
            its source, which sits above the wrapper's top edge. */}
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
          <section id="entourage" className="relative isolate scroll-mt-24 overflow-hidden px-6 pt-12 pb-24 md:px-12 md:pt-16 md:pb-36">
            <div className="mt-8 flex flex-col items-center text-center">
              <h2 data-fade className="text-center text-[clamp(3rem,7vw,6.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
                {entourage.title.toLowerCase()}
              </h2>
              {entourage.intro && (
                <p data-fade className="font-(family-name:--ff-inria-serif) mt-8 max-w-xl text-sm leading-relaxed text-muted sm:text-lg">
                  {entourage.intro}
                </p>
              )}
            </div>
            {/* Parents: one centred column, groom's parents above the bride's */}
            {entourage.parents.length > 0 && (
              <div className="mx-auto mt-20 max-w-5xl space-y-10 border-t-2 border-line pt-12">
                {entourage.parents.map((group, i) => (
                  <Names key={`${group.title}-${i}`} group={group} className="text-center" />
                ))}
              </div>
            )}
            {entourage.sponsors.names.length > 0 && (
              <div data-fade className="mt-20 border-t-2 border-line pt-12 text-center">
                <h3 className="text-[clamp(2.25rem,5vw,3.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
                  {entourage.sponsors.title.toLowerCase()}
                </h3>
                <ul className="mx-auto mt-6 max-w-2xl space-y-1.5">
                  {(() => {
                    // Order kept from the two-column layout: alternate the remaining names with these
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
                  })().map((name, i) => (
                    <li key={`${name}-${i}`} className={NAME_CLASS}>
                      {fixName(name)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div data-fade className="mt-20 border-t-2 border-line pt-12" />
            {entourage.secondaryTitle && (
              <h3 data-fade className="text-center text-[clamp(2.25rem,5vw,3.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
                {entourage.secondaryTitle.toLowerCase()}
              </h3>
            )}
            {/* Secondary sponsors: one centred column, each group under its own title */}
            {[bestMan, maidOfHonor].some(Boolean) && (
              <div className="mx-auto mt-10 max-w-2xl space-y-10 text-center">
                {[bestMan, maidOfHonor].map((group) => group && <Names key={group.title} group={group} />)}
              </div>
            )}
            {((groomsmen && bridesmaids) || otherEntourage.length > 0) && (
              <div data-fade className="mt-20 border-t-2 border-line" />
            )}
            {[groomsmen, bridesmaids, veilSponsors, cordSponsors, candleSponsors].some(Boolean) && (
              <div className="mx-auto mt-10 max-w-2xl space-y-10 text-center">
                {[groomsmen, bridesmaids, veilSponsors, cordSponsors, candleSponsors].map(
                  (group) => group && <Names key={group.title} group={group} />,
                )}
              </div>
            )}
            {otherEntourage.length > 0 && (
              <>
                <div data-fade className="mt-20 border-t-2 border-line pt-12" />
                {entourage.littleOnesTitle && (
                  <h3 data-fade className="text-center text-[clamp(2.25rem,5vw,3.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
                    {entourage.littleOnesTitle.toLowerCase()}
                  </h3>
                )}
                {otherEntourage.map((group) => {
                  return (
                    <div key={group.title} className="mx-auto mt-10 max-w-2xl text-center">
                      <Names group={group} className="text-center" />
                    </div>
                  );
                })}
              </>
            )}
            {/* Closing photo after the little ones, in colour: a full-bleed banner (negative margins cancel the
                section's side and bottom padding). Phones show the whole photo uncropped (portrait); from md up it is
                a wide band cropped around the focal point. The overlay fades the top and bottom edges into the page
                background and softens the corners. */}
            {entourage.photo && (
              <figure data-fade className="relative -mx-6 -mb-24 mt-20 overflow-hidden md:-mx-12 md:-mb-36">
                <Image
                  src={entourage.photo.url}
                  alt={entourage.photo.alt}
                  width={entourage.photo.width}
                  height={entourage.photo.height}
                  sizes="100vw"
                  className="h-auto w-full md:max-h-[70svh] md:object-cover"
                  style={{ objectPosition: focalPosition(entourage.photo) }}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, var(--color-background) 0%, transparent 22%, transparent 76%, var(--color-background) 100%), radial-gradient(ellipse at 55% 50%, transparent 55%, color-mix(in srgb, var(--color-background) 55%, transparent) 100%)",
                  }}
                />
              </figure>
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

        {/* Schedule: vertical timeline */}
        <section id="schedule" className="relative scroll-mt-24 overflow-hidden px-6 pt-12 pb-24 md:px-12 md:pt-16 md:pb-36">
          {/* Timeline */}
          <div className="relative z-10 mx-auto max-w-2xl">
            <div className="mt-8">
              <h2 data-fade className="text-center text-[clamp(3rem,7vw,6.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
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
                        <span className="font-(family-name:--ff-oswald) text-lg font-semibold leading-snug text-foreground sm:text-xl">{s.time}</span>
                        <p className="mt-1 font-(family-name:--ff-oswald) text-xs uppercase tracking-[0.15em] text-foreground sm:text-sm">{s.item}</p>
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
        <section className="scroll-mt-24 px-6 pt-16 text-center md:px-12 md:pt-24">
          <div data-fade className="border-t-2 border-line pt-12" />
          <h2 data-fade className="text-center text-[clamp(3rem,7vw,6.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
            Attire Guide
          </h2>
          <p data-fade className="mt-8 text-[clamp(2.25rem,5vw,3.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>principal sponsors</p>
          <p data-fade className="font-(family-name:--ff-inria-serif) mt-4 text-sm font-medium uppercase tracking-[0.2em] text-accent-ink">Formal Attire</p>
          <p data-fade className="font-(family-name:--ff-inria-serif) mt-4 text-sm leading-relaxed text-foreground sm:text-base"><span className="font-semibold">Ladies:</span> Long Gown in Beige</p>
          <p data-fade className="font-(family-name:--ff-inria-serif) mt-2 text-sm leading-relaxed text-foreground sm:text-base"><span className="font-semibold">Gentlemen:</span> Americana Coat and Slacks, Beige Neck Tie and inner with White</p>
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
          <p data-fade className="mt-6 text-[clamp(2.25rem,5vw,3.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>wedding guests</p>
          <p data-fade className="font-(family-name:--ff-inria-serif) mt-6 text-sm font-medium uppercase tracking-[0.2em] text-accent-ink">Semi-Formal</p>
          <p data-fade className="font-(family-name:--ff-inria-serif) mt-4 text-sm leading-relaxed text-foreground sm:text-base"><span className="font-semibold">Ladies:</span> Long Dress or Short Dress</p>
          <p data-fade className="font-(family-name:--ff-inria-serif) mt-2 text-sm leading-relaxed text-foreground sm:text-base"><span className="font-semibold">Gentlemen:</span> Polo, Polo Shirt, or Long Sleeves</p>
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
          {/* Attire note, styled like the Reminders entries below */}
          <div data-fade className="mx-auto mt-10 max-w-md rounded-lg px-6 py-5 ring-1 ring-line">
            <h3 className="font-(family-name:--ff-inria-serif) text-sm font-medium uppercase tracking-[0.2em] text-accent-ink">Note</h3>
            <p className="font-(family-name:--ff-inria-serif) mt-2 text-sm leading-relaxed text-muted sm:text-base">AVOID black, white, and overly casual attire (e.g. T-shirts, shorts, jeans, sneakers).</p>
            <p className="font-(family-name:--ff-inria-serif) mt-2 text-sm leading-relaxed text-muted sm:text-base">Please RESERVE WHITE for the Bride.</p>
          </div>
        </section>

        {/* Reminders */}
        <section className="scroll-mt-24 px-6 pt-24 text-center md:px-12 md:pt-36">
          <div data-fade className="border-t-2 border-line pt-12" />
          <h2 data-fade className="text-center text-[clamp(3rem,7vw,6.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
            Reminders
          </h2>
          <div data-fade className="mx-auto mt-4 w-32">
            <Image src="/images/gold-ornament.png" alt="" width={450} height={106} className="w-full" aria-hidden="true" />
          </div>
          <h3 data-fade className="font-(family-name:--ff-inria-serif) mt-4 text-sm font-medium uppercase tracking-[0.2em] text-accent-ink">Please Arrive Early</h3>
          <p data-fade className="font-(family-name:--ff-inria-serif) mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted sm:text-base">To help everything to run smoothly, please arrive at least 30 minutes before the start of the ceremony.</p>
          <div data-fade className="mx-auto mt-4 w-32">
            <Image src="/images/gold-ornament.png" alt="" width={450} height={106} className="w-full" aria-hidden="true" />
          </div>
          <h3 data-fade className="font-(family-name:--ff-inria-serif) mt-4 text-sm font-medium uppercase tracking-[0.2em] text-accent-ink">Please Keep Phones Off During the Ceremony</h3>
          <p data-fade className="font-(family-name:--ff-inria-serif) mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted sm:text-base">To honor the intimacy of our vows, we ask that all guests keep phones and cameras put away during the ceremony and refrain from stepping into the aisle so our photographer may work freely.</p>
          <div data-fade className="mx-auto mt-4 w-32">
            <Image src="/images/gold-ornament.png" alt="" width={450} height={106} className="w-full" aria-hidden="true" />
          </div>
          <h3 data-fade className="font-(family-name:--ff-inria-serif) mt-4 text-sm font-medium uppercase tracking-[0.2em] text-accent-ink">Celebrating Intimately: Adults Only</h3>
          <p data-fade className="font-(family-name:--ff-inria-serif) mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted sm:text-base">We kindly ask that guests join us without children, as we are planning an adults‑only ceremony and reception to ensure a comfortable experience for everyone.</p>
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

        {/* Gallery: the photos glide right to left on their own, in a loop (pauses on hover; with reduced
            motion respected, see lib/motion.ts, it's a strip guests can swipe). The track holds the photos three times so the loop is seamless.
            Below it, in the same marble band, the landscape photos stand still, full width, one under another. */}
        {(galleryPhotos.length > 0 || galleryBanners.length > 0) && (
          <section id="gallery" className="scroll-mt-24 pt-12 md:pt-16">
            <div className="px-6 md:px-12">
              <div data-fade className="border-t-2 border-line" />
            </div>
            {/* Light marble band from just under the line: same background as the venues section (white marble
                with a soft burgundy glow in the corners). Re-scopes the theme tokens so the text stays readable. */}
            <div
              className="relative isolate overflow-hidden bg-[#e8ddd0] pt-12 pb-24 md:pb-36"
              style={
                {
                  "--foreground": "#3b0d18",
                  "--muted": "#7a4650",
                  "--accent-ink": "#8a6516",
                  "--line": "rgb(212 174 98 / 0.5)",
                } as React.CSSProperties
              }
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center"
                style={{ backgroundImage: "url(/images/marble-bg-v1.jpg)" }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  backgroundImage:
                    "radial-gradient(ellipse 60% 45% at 0% 0%, rgba(122,28,46,0.14), transparent 70%), radial-gradient(ellipse 60% 45% at 100% 0%, rgba(122,28,46,0.12), transparent 70%), radial-gradient(ellipse 60% 45% at 0% 100%, rgba(122,28,46,0.12), transparent 70%), radial-gradient(ellipse 60% 45% at 100% 100%, rgba(122,28,46,0.14), transparent 70%)",
                }}
              />
              <div className="px-6 md:px-12">
                {/* Title with the intro centred below it, on every screen size */}
                <div className="flex flex-col items-center gap-6 text-center">
                  <h2 data-fade className="text-[clamp(3rem,7vw,6.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.45), 0 0 20px rgba(201,168,76,0.25)" }}>
                    {gallery.title.toLowerCase()}
                  </h2>
                  {gallery.intro && <p data-fade className="max-w-sm text-lg text-muted">{gallery.intro}</p>}
                </div>
              </div>
              {galleryPhotos.length > 0 && (
                <div data-fade className="gallery-marquee mt-12 lg:mt-20">
                  <div className="gallery-marquee-track" style={{ "--marquee-duration": `${galleryPhotos.length * 6}s` } as React.CSSProperties}>
                    {[0, 1, 2].map((copy) =>
                      galleryPhotos.map((p, i) => (
                        <figure
                          key={`${copy}-${p.url}-${i}`}
                          aria-hidden={copy > 0 || undefined}
                          data-marquee-copy={copy > 0 ? "" : undefined}
                          className="relative aspect-[2/3] h-[22rem] shrink-0 overflow-hidden shadow-[0_24px_50px_-20px_rgba(59,13,24,0.45)] ring-1 ring-line sm:h-[26rem] lg:h-[32rem]"
                        >
                          <Image
                            src={p.url}
                            alt={copy > 0 ? "" : p.alt}
                            fill
                            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 18rem, 15rem"
                            className="object-cover"
                            style={{ objectPosition: focalPosition(p) }}
                          />
                        </figure>
                      )),
                    )}
                  </div>
                </div>
              )}
              {/* Landscapes: their own section, sharing the gallery's marble so the background carries on */}
              {galleryBanners.length > 0 && (
                <section aria-label={gallery.title} className="mt-12 flex flex-col gap-4 px-6 md:px-12 lg:mt-20 lg:gap-6">
                  {galleryBanners.map((p, i) => (
                    <figure key={`${p.url}-${i}`} className="overflow-hidden shadow-[0_24px_50px_-20px_rgba(59,13,24,0.45)] ring-1 ring-line">
                      <Image src={p.url} alt={p.alt} width={p.width} height={p.height} sizes="100vw" className="h-auto w-full" />
                    </figure>
                  ))}
                </section>
              )}
            </div>
          </section>
        )}

        {/* RSVP */}
        <section id="rsvp" className="scroll-mt-24 px-6 py-24 md:px-12 md:py-36">
          <div data-fade className="border-t-2 border-line pt-12" />
          <h2 data-fade className="text-center text-[clamp(3rem,7vw,6.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
            {sections.rsvpTitle.toLowerCase()}
          </h2>
          {rsvpOpen && (
            <p data-fade className="font-(family-name:--ff-inria-serif) mt-16 text-center text-lg text-muted">
              {fill(sections.respondBy, { date: wedding.rsvpBy })}
            </p>
          )}
          <div className="mx-auto mt-16 max-w-xl">
            <RsvpForm guest={guest} open={rsvpOpen} labels={text.rsvpForm} messages={text.rsvpMessages} />
          </div>
        </section>

        {/* Well wishes: guests leave a message everyone can read (one per guest, newest first) */}
        <section id="wishes" className="scroll-mt-24 px-6 py-24 md:px-12 md:py-36">
          <div data-fade className="border-t-2 border-line pt-12" />
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 data-fade className="text-[clamp(3rem,7vw,6.5rem)] capitalize leading-[1.3] text-accent-ink" style={{ fontFamily: "var(--ff-eyesome)", textShadow: "0 0 8px rgba(201,168,76,0.6), 0 0 20px rgba(201,168,76,0.3)" }}>
              {text.wishes.title.toLowerCase()}
            </h2>
            {text.wishes.intro && <p data-fade className="font-(family-name:--ff-inria-serif) max-w-xl text-lg text-muted">{text.wishes.intro}</p>}
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