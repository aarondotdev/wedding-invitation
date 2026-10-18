import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import Invitation from "@/components/Invitation";
import { getGuestByCode, markOpened } from "@/lib/supabase";
import { getWedding, isRsvpOpen } from "@/lib/wedding";

// Allowed to block on the code lookup: there is no useful loading UI to show before the
// guest is verified. Invalid codes render not-found.tsx (noindex; status stays 200 once
// the shell has streamed).
export const instant = false;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function InvitePage({ params }: PageProps<"/i/[code]">) {
  const { code } = await params;
  const guest = await getGuestByCode(code);
  if (!guest) notFound();

  after(() => markOpened(guest));

  const [wedding, rsvpOpen] = await Promise.all([getWedding(), isRsvpOpen()]);

  return <Invitation wedding={wedding} guest={guest} rsvpOpen={rsvpOpen} />;
}
