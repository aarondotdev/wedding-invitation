import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Great_Vibes, Outfit } from "next/font/google";
import Script from "next/script";
import { getSeo } from "@/lib/site-content";
import "./globals.css";

const display = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
});

const sans = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

// Hide animated elements until the motion layer has set them up (avoids a flash of content),
// but never for reduced motion, and never for more than 3 s in case scripts fail to load.
const MOTION_BOOTSTRAP = `(function(){var d=document.documentElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.classList.add("motion-pending");setTimeout(function(){d.classList.remove("motion-pending")},3000)})()`;

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
  themeColor: "#3b0d18",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${script.variable} h-full antialiased`}
      // MOTION_BOOTSTRAP adds a class before hydration
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOTSTRAP }} />
        {/* React Grab (react-grab.com): hover an element, press Ctrl/⌘+C to copy its component and source
            for a coding agent. Local development only; `npm run dev` copies the pinned build to public/. */}
        {process.env.NODE_ENV === "development" && (
          <Script src="/react-grab.js" crossOrigin="anonymous" strategy="beforeInteractive" />
        )}
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
