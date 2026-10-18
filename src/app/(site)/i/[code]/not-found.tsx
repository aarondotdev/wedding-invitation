import Divider from "@/components/Divider";
import { getPageText } from "@/lib/site-content";

export default async function InviteNotFound() {
  const { pages } = await getPageText();

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-blush to-background px-6 py-20 text-center">
      <h1 className="font-script text-6xl text-accent sm:text-7xl">{pages.invalidLinkTitle}</h1>
      <Divider />
      <p className="max-w-md text-xl italic">{pages.invalidLinkMessage}</p>
    </main>
  );
}
