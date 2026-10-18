import { getPageText } from "@/lib/site-content";

export default async function InviteNotFound() {
  const { pages } = await getPageText();

  return (
    <main className="hero-glow flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="font-display text-[clamp(3.5rem,10vw,8rem)] leading-none">{pages.invalidLinkTitle}</h1>
      <div aria-hidden className="my-10 h-16 w-px bg-accent" />
      <p className="max-w-md text-lg leading-relaxed text-muted">{pages.invalidLinkMessage}</p>
    </main>
  );
}
