import Divider from "@/components/Divider";
import { wedding } from "@/lib/wedding";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-blush to-background px-6 py-20 text-center">
      <h1 className="font-script text-7xl leading-tight sm:text-8xl">
        {wedding.partner1}
        <span className="mx-4 block text-5xl text-accent sm:inline sm:text-6xl">&amp;</span>
        {wedding.partner2}
      </h1>
      <Divider />
      <p className="max-w-md text-xl italic">
        This celebration is by invitation. Please open the personal link we sent you to view
        your invitation.
      </p>
    </main>
  );
}
