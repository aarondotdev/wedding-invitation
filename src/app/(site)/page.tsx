import { getPageText } from "@/lib/site-content";
import { themeScopeProps } from "@/theme/apply";

// The site is only for invited guests: the bare address just shows a short message
// (Page text → "Home page message"). Guests open their personal link, /i/[code].
export const instant = false;

export default async function Home() {
  const { pages } = await getPageText();

  return (
    <main
      {...themeScopeProps()}
      className="hero-glow flex flex-1 flex-col items-center justify-center px-6 py-20 text-center font-sans text-foreground"
    >
      <h1 className="font-display text-[clamp(2.5rem,8vw,6rem)] leading-none">{pages.homeMessage}</h1>
    </main>
  );
}
