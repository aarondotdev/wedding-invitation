import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes } from "next/font/google";
import { getSeo } from "@/lib/site-content";
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
  const seo = await getSeo();
  const image = { ...seo.shareImage };

  return {
    // Makes relative image URLs absolute, which link previews require
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: seo.title,
    description: seo.description,
    applicationName: seo.title,
    openGraph: {
      type: "website",
      siteName: seo.title,
      title: seo.shareTitle,
      description: seo.shareDescription,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.shareTitle,
      description: seo.shareDescription,
      images: [image],
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
