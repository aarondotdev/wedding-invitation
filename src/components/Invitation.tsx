import Image from "next/image";
import Countdown from "@/components/Countdown";
import InvitationMotion from "@/components/motion/InvitationMotion";
import RsvpForm from "@/components/RsvpForm";
import type { Details, Entourage, GalleryPhoto, NameGroup } from "@/lib/details-defaults";
import { fill, type PagePhotos, type PageText, type SitePhoto, type StoryChapter } from "@/lib/site-content-defaults";
import type { Guest } from "@/lib/supabase";
import type { Wedding } from "@/lib/wedding-defaults";

const pad = (n: number) => String(n).padStart(2, "0");

// "01 — Our story" with a hairline, as in an editorial spread
function SectionLabel({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <div data-fade className="border-b border-line pb-4 text-xs font-medium uppercase tracking-[0.3em] text-foreground">
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
        />
      </div>
    </div>
  );
}

// Hand-drawn gold flourishes; they draw themselves as they scroll into view
function Flourish({ className }: { className?: string }) {
  return (
    <svg data-draw aria-hidden viewBox="0 0 400 900" fill="none" className={className}>
      <path
        d="M210 0C160 120 330 210 300 360C270 510 70 520 90 680C105 800 260 820 330 900"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
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
          <p data-fade className="text-sm font-medium text-muted">{pad(index)}</p>
          <h3 data-split className="mt-8 font-display text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.95]">
            {title}
          </h3>
        </div>
        <div data-fade className={`mt-8 text-lg leading-relaxed text-muted ${photo && flipped ? "md:ml-auto" : ""} max-w-md`}>
          {children}
        </div>
      </div>
    </article>
  );
}

function Names({ group, className }: { group: NameGroup; className?: string }) {
  return (
    <div data-fade className={className}>
      <h4 className="text-xs font-medium uppercase tracking-[0.3em] text-accent">{group.title}</h4>
      <ul className="mt-4 space-y-1.5">
        {group.names.map((name, i) => (
          <li key={`${name}-${i}`} className="font-display text-2xl leading-snug">
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Header({ wedding, text }: { wedding: Wedding; text: PageText }) {
  const links: Array<[string, string, string]> = [
    ["#story", text.nav.story, "md:inline"],
    ["#celebration", text.nav.celebration, "md:inline"],
    ["#entourage", text.nav.entourage, "xl:inline"],
    ["#details", text.nav.details, "xl:inline"],
    ["#schedule", text.nav.schedule, "lg:inline"],
    ["#faq", text.nav.faq, "lg:inline"],
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-line bg-background/75 px-6 py-4 backdrop-blur-md md:px-12">
      <a href="#top" className="font-display text-2xl" aria-label={`${wedding.partner1} ${text.hero.ampersand} ${wedding.partner2}`}>
        {wedding.partner1.charAt(0)}
        <span className="font-script text-accent"> {text.hero.ampersand} </span>
        {wedding.partner2.charAt(0)}
      </a>
      <nav className="flex items-center gap-7 text-xs font-medium uppercase tracking-[0.25em]">
        {links.map(([href, label, show]) => (
          <a key={href} href={href} className={`hidden transition-colors hover:text-accent ${show}`}>
            {label}
          </a>
        ))}
        <a href="#rsvp" className="rounded-full border border-accent px-5 py-2 text-accent transition-colors hover:bg-accent hover:text-background">
          {text.nav.rsvp}
        </a>
      </nav>
    </header>
  );
}

export default function Invitation({
  wedding,
  text,
  entourage,
  details,
  guest,
  rsvpOpen,
}: {
  wedding: Wedding;
  text: PageText & { photos: PagePhotos; chapters: StoryChapter[] };
  entourage: Entourage;
  details: Details & { dressCodePhoto: GalleryPhoto | null; galleryPhotos: GalleryPhoto[] };
  guest: Guest;
  rsvpOpen: boolean;
}) {
  const { hero, sections, story, statement, photos, chapters } = text;
  const { dressCode, faq, gallery, galleryPhotos } = details;
  const hasEntourage = entourage.parents.length + entourage.sponsors.names.length + entourage.entourage.length > 0;
  let section = 0;

  return (
    <InvitationMotion header={<Header wedding={wedding} text={text} />}>
      <main>
        {/* Hero: giant names over an arched portrait */}
        <section id="top" className="hero-glow relative isolate flex min-h-svh flex-col overflow-hidden px-6 pb-12 pt-28 md:px-12">
          <Flourish className="pointer-events-none absolute left-[30%] top-0 -z-10 h-full w-auto text-accent/70" />

          <div data-fade className="relative z-10 max-w-[16rem] text-lg leading-snug md:absolute md:left-12 md:top-[26%]">
            <p className="mb-3 font-display text-2xl italic">{fill(hero.greeting, { name: guest.name })}</p>
            <p className="text-sm uppercase tracking-[0.3em] text-accent">{hero.intro}</p>
          </div>

          <div className="relative flex min-h-[26rem] flex-1 items-center justify-center py-10 md:min-h-0">
            {/* Centred with flexbox, not translate: GSAP animates this element and would fight a CSS translate */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Photo
                photo={photos.hero}
                priority
                dim
                sizes="(min-width: 768px) 32vw, 70vw"
                className="aspect-[4/5] w-[min(58vw,25rem)] rounded-t-full"
              />
            </div>
            <h1 className="relative z-10 text-center font-display text-[clamp(4rem,14vw,12rem)] leading-[0.82]">
              <span data-hero-title className="block whitespace-nowrap md:-translate-x-[14%]">
                {wedding.partner1}
              </span>
              <span className="my-2 block font-script text-[0.32em] leading-none text-accent md:-translate-x-[36%]">{hero.ampersand}</span>
              <span data-hero-title className="block whitespace-nowrap md:translate-x-[12%]">
                {wedding.partner2}
              </span>
            </h1>
          </div>

          <div data-fade="0.6" className="relative z-10 max-w-sm md:absolute md:bottom-12 md:left-12">
            <p className="text-lg italic text-foreground/80">{hero.invitationLine}</p>
            <p className="mt-4 font-display text-3xl">{wedding.displayDate}</p>
            {wedding.events[0]?.venue && <p className="mt-1 text-muted">{wedding.events[0].venue}</p>}
            <a
              href="#rsvp"
              className="mt-6 inline-block rounded-full border border-foreground/40 px-8 py-3 text-xs font-medium uppercase tracking-[0.3em] transition-colors hover:border-accent hover:text-accent"
            >
              {hero.rsvpButton}
            </a>
          </div>
        </section>

        {/* Our story, then numbered chapters with alternating photos */}
        <section id="story" className="scroll-mt-24 px-6 py-24 md:px-12 md:py-36">
          <SectionLabel index={++section}>{text.nav.story}</SectionLabel>
          <div className={`mt-16 grid gap-12 md:grid-cols-2 md:gap-20 ${photos.story ? "md:items-center" : ""}`}>
            <div>
              <h2 data-split className="font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.95]">
                {story.title}
              </h2>
              {photos.story && (
                <Photo photo={photos.story} sizes="(min-width: 768px) 40vw, 100vw" className="mt-12 aspect-[4/5] w-full max-w-md" />
              )}
            </div>
            <div className="md:pt-6">
              <p data-fade className="max-w-xl text-lg leading-relaxed text-muted">
                {story.text}
              </p>
              <p data-fade className="mt-10 font-script text-6xl text-accent">
                {wedding.partner1} {hero.ampersand} {wedding.partner2}
              </p>
            </div>
          </div>
          {chapters.length > 0 && (
            <div className="mt-28 space-y-24 md:mt-40 md:space-y-36">
              {chapters.map((chapter, i) => (
                <FeatureRow key={`${chapter.title}-${i}`} index={i + 1} title={chapter.title} photo={chapter.photo} flipped={i % 2 === 1}>
                  {chapter.text && <p>{chapter.text}</p>}
                </FeatureRow>
              ))}
            </div>
          )}
        </section>

        {/* Countdown */}
        <section className="px-6 py-20 md:px-12">
          <SectionLabel index={++section}>{sections.countdownTitle}</SectionLabel>
          <div data-fade className="mt-14">
            <Countdown date={wedding.date} labels={text.countdown} />
          </div>
        </section>

        {/* Celebration: ceremony and reception as alternating rows */}
        <section id="celebration" className="scroll-mt-24 px-6 py-24 md:px-12 md:py-36">
          <SectionLabel index={++section}>{text.nav.celebration}</SectionLabel>
          <h2 data-split className="mt-16 max-w-4xl font-display text-[clamp(3rem,8vw,7.5rem)] leading-[0.95]">
            {sections.eventsTitle}
          </h2>
          <div className="mt-20 space-y-24 md:space-y-36">
            {wedding.events.map((event, i) => (
              <FeatureRow key={`${event.title}-${i}`} index={i + 1} title={event.title} photo={event.photo} flipped={i % 2 === 1}>
                <p className="font-display text-3xl text-foreground">{event.time}</p>
                <p className="mt-2 text-foreground">{event.venue}</p>
                <p>{event.address}</p>
                {event.mapUrl && (
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-block border-b border-accent pb-1 text-xs font-medium uppercase tracking-[0.3em] text-accent"
                  >
                    {sections.viewMap}
                  </a>
                )}
              </FeatureRow>
            ))}
          </div>
          {wedding.dressCode && (
            <p data-fade className="mt-24 border-t border-line pt-8 text-lg">
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-accent">{sections.dressCodeLabel}</span>{" "}
              <span className="font-display text-2xl italic">{wedding.dressCode}</span>
            </p>
          )}
        </section>

        {/* Full-width photo band with a gold line running down into the statement */}
        {photos.statementBand && (
          <div className="relative">
            <Photo photo={photos.statementBand} sizes="100vw" className="h-[60vh] w-full md:h-[85vh]" />
            <div aria-hidden className="absolute bottom-0 left-1/2 z-10 h-24 w-px translate-y-1/2 bg-foreground" />
          </div>
        )}

        {/* Statement: words light up as you scroll, with a small portrait and a large landscape */}
        <section className="relative px-6 py-28 md:px-12 md:py-40">
          {!photos.statementBand && <div aria-hidden className="mx-auto mb-16 h-24 w-px bg-accent" />}
          <div className="relative grid gap-12 md:grid-cols-12">
            {photos.statement && (
              <Photo
                photo={photos.statement}
                sizes="(min-width: 768px) 22vw, 60vw"
                className="aspect-[4/5] w-2/3 md:col-span-3 md:mt-24 md:w-full"
              />
            )}
            <p
              data-scrub
              className={`relative z-10 font-display text-[clamp(3rem,9vw,9rem)] leading-[0.95] ${photos.statement ? "md:col-span-9" : "md:col-span-12 md:text-center"}`}
            >
              {statement.text}
            </p>
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-12">
            <p data-fade className="max-w-xs text-lg leading-relaxed text-muted md:col-span-4 md:col-start-2 md:pt-10">
              {statement.note}
            </p>
            {photos.statementSecondary && (
              <Photo
                photo={photos.statementSecondary}
                sizes="(min-width: 768px) 45vw, 100vw"
                className="aspect-[5/3] w-full md:col-span-7 md:col-start-6 md:-mt-24"
              />
            )}
          </div>
        </section>

        {/* Family & entourage */}
        {hasEntourage && (
          <section id="entourage" className="scroll-mt-24 px-6 py-24 md:px-12 md:py-36">
            <SectionLabel index={++section}>{text.nav.entourage}</SectionLabel>
            <div className="mt-16 grid gap-10 md:grid-cols-2">
              <h2 data-split className="font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.95]">
                {entourage.title}
              </h2>
              {entourage.intro && (
                <p data-fade className="max-w-md self-end text-lg leading-relaxed text-muted">
                  {entourage.intro}
                </p>
              )}
            </div>
            {entourage.parents.length > 0 && (
              <div className="mt-20 grid gap-12 border-t border-line pt-12 sm:grid-cols-2">
                {entourage.parents.map((g, i) => (
                  <Names key={`${g.title}-${i}`} group={g} />
                ))}
              </div>
            )}
            {entourage.sponsors.names.length > 0 && (
              <div data-fade className="mt-20 border-t border-line pt-12">
                <h3 className="text-xs font-medium uppercase tracking-[0.3em] text-accent">{entourage.sponsors.title}</h3>
                <ul className="mt-6 columns-1 gap-12 sm:columns-2">
                  {entourage.sponsors.names.map((name, i) => (
                    <li key={`${name}-${i}`} className="break-inside-avoid py-1.5 font-display text-2xl">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {entourage.entourage.length > 0 && (
              <div className="mt-20 grid gap-x-12 gap-y-14 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-3">
                {entourage.entourage.map((g, i) => (
                  <Names key={`${g.title}-${i}`} group={g} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Dress code */}
        {(dressCode.description || dressCode.palette.length > 0) && (
          <section id="details" className="scroll-mt-24 px-6 py-24 md:px-12 md:py-36">
            <SectionLabel index={++section}>{text.nav.details}</SectionLabel>
            <div className="mt-16 grid gap-12 md:grid-cols-12">
              <div className={details.dressCodePhoto ? "md:col-span-7" : "md:col-span-12"}>
                <h2 data-split className="font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.95]">
                  {dressCode.title}
                </h2>
                {dressCode.description && (
                  <p data-fade className="mt-10 max-w-2xl text-lg leading-relaxed text-muted">
                    {dressCode.description}
                  </p>
                )}
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

        {/* Schedule: hairline rows */}
        <section id="schedule" className="scroll-mt-24 px-6 py-24 md:px-12 md:py-36">
          <SectionLabel index={++section}>{text.nav.schedule}</SectionLabel>
          <div className="mt-16 grid gap-10 md:grid-cols-2">
            <h2 data-split className="font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.95]">
              {sections.scheduleTitle}
            </h2>
            <Arrow className="hidden h-40 justify-self-center text-accent md:block" />
          </div>
          <ol className="mt-16">
            {wedding.schedule.map((s, i) => (
              <li
                key={`${s.time}-${i}`}
                data-fade
                className="grid grid-cols-[3rem_1fr] items-baseline gap-x-6 gap-y-1 border-t border-line py-8 md:grid-cols-[6rem_16rem_1fr]"
              >
                <span className="text-sm text-muted">{pad(i + 1)}</span>
                <span className="font-display text-4xl md:text-5xl">{s.time}</span>
                <span className="col-start-2 text-xl md:col-start-3">{s.item}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Gallery: scrolls sideways on desktop, photos turn from black-and-white to colour */}
        {galleryPhotos.length > 0 && (
          <section id="gallery" data-hscroll className="scroll-mt-24 overflow-hidden py-24 md:py-36">
            <div className="px-6 md:px-12">
              <SectionLabel index={++section}>{text.nav.gallery}</SectionLabel>
              <div className="mt-12 flex flex-wrap items-end justify-between gap-6">
                <h2 data-split className="font-display text-[clamp(3rem,6vw,5.5rem)] leading-[0.95]">
                  {gallery.title}
                </h2>
                {gallery.intro && <p data-fade className="max-w-sm text-lg text-muted">{gallery.intro}</p>}
              </div>
            </div>
            <div data-hscroll-track className="group/track mt-12 grid grid-cols-2 gap-3 px-6 md:grid-cols-3 md:gap-4 md:px-12">
              {galleryPhotos.map((p, i) => (
                <figure key={`${p.url}-${i}`} className="overflow-hidden group-[.is-hscroll]/track:shrink-0">
                  <Image
                    data-colorize
                    src={p.url}
                    alt={p.alt}
                    width={p.width}
                    height={p.height}
                    sizes="(min-width: 1024px) 45vw, 50vw"
                    className="h-full w-full object-cover grayscale group-[.is-hscroll]/track:h-[min(55vh,34rem)] group-[.is-hscroll]/track:w-auto"
                  />
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Questions & answers */}
        {faq.items.length > 0 && (
          <section id="faq" className="scroll-mt-24 px-6 py-24 md:px-12 md:py-36">
            <SectionLabel index={++section}>{text.nav.faq}</SectionLabel>
            <div className="mt-16 grid gap-12 md:grid-cols-12">
              <div className="md:col-span-5">
                {faq.intro && <p data-fade className="text-xs font-medium uppercase tracking-[0.3em] text-accent">{faq.intro}</p>}
                <h2 data-split className="mt-6 font-display text-[clamp(3rem,6vw,5.5rem)] leading-[0.95]">
                  {faq.title}
                </h2>
              </div>
              <div className="md:col-span-7">
                {faq.items.map((item, i) => (
                  <details key={`${item.question}-${i}`} data-fade className="group border-t border-line py-6 last:border-b">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-2xl leading-snug [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <span aria-hidden className="mt-1 text-accent transition-transform duration-300 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* RSVP */}
        <section id="rsvp" className="scroll-mt-24 px-6 py-24 md:px-12 md:py-36">
          <SectionLabel index={++section}>{text.nav.rsvp}</SectionLabel>
          <h2 data-split className="mt-16 text-center font-display text-[clamp(3.5rem,11vw,11rem)] leading-[0.9]">
            {sections.rsvpTitle}
          </h2>
          {rsvpOpen && (
            <p data-fade className="mt-8 text-center text-lg text-muted">
              {fill(sections.respondBy, { date: wedding.rsvpBy })}
            </p>
          )}
          <div className="mx-auto mt-16 max-w-xl">
            <RsvpForm guest={guest} open={rsvpOpen} labels={text.rsvpForm} messages={text.rsvpMessages} />
          </div>
        </section>

        <footer className="border-t border-line px-6 py-16 text-center md:px-12">
          <p className="font-script text-6xl text-accent md:text-7xl">
            {wedding.partner1} {hero.ampersand} {wedding.partner2}
          </p>
          <p className="mt-4 font-display text-xl">{wedding.displayDate}</p>
          {wedding.hashtag && <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted">{wedding.hashtag}</p>}
        </footer>
      </main>
    </InvitationMotion>
  );
}
