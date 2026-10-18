import Divider from "@/components/Divider";

export default function InviteNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-blush to-background px-6 py-20 text-center">
      <h1 className="font-script text-6xl text-accent sm:text-7xl">Oh dear</h1>
      <Divider />
      <p className="max-w-md text-xl italic">
        This invitation link isn&apos;t valid. Please check the link you received, or reach
        out to the couple for a new one.
      </p>
    </main>
  );
}
