import { getPageText } from "@/lib/site-content";
import { themeScopeProps } from "@/theme/apply";
import { getWedding } from "@/lib/wedding";

export default async function Home() {
  const [wedding, text] = await Promise.all([getWedding(), getPageText()]);

  return (
    <main
      {...themeScopeProps()}
      className="hero-glow flex flex-1 flex-col items-center justify-center px-6 py-20 text-center font-sans text-foreground"
    >
      <h1 className="font-display text-[clamp(4rem,13vw,11rem)] leading-[0.85]">
        {wedding.partner1}
        <span className="my-3 block font-script text-[0.32em] leading-none text-accent-ink">{text.hero.ampersand}</span>
        {wedding.partner2}
      </h1>
      <div aria-hidden className="my-10 h-16 w-px bg-accent" />
      <p className="max-w-md text-lg leading-relaxed text-muted">{text.pages.homeMessage}</p>
    </main>
  );
}
