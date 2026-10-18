import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes } from "next/font/google";
import { getWedding } from "@/lib/wedding";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

export async function generateMetadata(): Promise<Metadata> {
  const wedding = await getWedding();
  const title = `${wedding.partner1} and ${wedding.partner2}`;
  // Shown in link previews to anyone the link reaches, so no venue details here.
  const description = `Together with their families, ${wedding.partner1} & ${wedding.partner2} invite you to celebrate their wedding on ${wedding.displayDate}.`;

  return {
    // Makes the opengraph-image URL absolute, which link previews require
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title,
    description,
    applicationName: title,
    openGraph: {
      type: "website",
      siteName: title,
      title: `You're invited: ${title}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `You're invited: ${title}`,
      description,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#faf7f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${script.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
