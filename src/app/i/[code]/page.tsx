import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { after, userAgent } from "next/server";
import Invitation from "@/components/Invitation";
import { getGuestByCode, markOpened } from "@/lib/supabase";
import { isRsvpOpen } from "@/lib/wedding";

// Allowed to block on the code lookup: there is no useful loading UI to show before the
// guest is verified. Invalid codes render not-found.tsx (noindex; status stays 200 once
// the shell has streamed).
export const instant = false;

// Chat-app link preview fetchers not always covered by userAgent().isBot
const PREVIEW_BOTS =
  /facebookexternalhit|facebookcatalog|meta-externalagent|WhatsApp|Viber|TelegramBot|Twitterbot|Slackbot|Discordbot|LinkedInBot|SkypeUriPreview|Snapchat|Pinterest|redditbot|Applebot|Google-PageRenderer|bot\b|crawler|spider|preview/i;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function InvitePage({ params }: PageProps<"/i/[code]">) {
  const { code } = await params;
  const guest = await getGuestByCode(code);
  if (!guest) notFound();

  // Link previews (WhatsApp, Messenger, etc.) fetch the page when a link is pasted into a chat;
  // only count real visits as "opened".
  const requestHeaders = await headers();
  const ua = requestHeaders.get("user-agent") ?? "";
  if (!userAgent({ headers: requestHeaders }).isBot && !PREVIEW_BOTS.test(ua)) {
    after(() => markOpened(guest));
  }

  return <Invitation guest={guest} rsvpOpen={isRsvpOpen()} />;
}
