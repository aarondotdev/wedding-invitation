import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { getSeo } from "@/lib/site-content";
import { PREVIEW_STORAGE_KEY, scopeVariables } from "@/theme/apply";
import { themeConfig } from "@/theme/config";
import { fontVariableClasses } from "@/theme/fonts";
import "./globals.css";

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
  themeColor: "#ffffff",
};

// Development only: data for the external bootstrap that restores theme previews.
function themePreviewData() {
  const vars = (sel: { theme: string; font: string }) => scopeVariables({ ...themeConfig.defaults, ...sel });
  const data = {
    key: PREVIEW_STORAGE_KEY,
    defaults: themeConfig.defaults,
    ids: {
      theme: themeConfig.themes.map((t) => t.id),
      font: themeConfig.fonts.map((f) => f.id),
      header: themeConfig.headers.map((h) => h.id),
      layout: themeConfig.layouts.map((l) => l.id),
    },
    themeVars: Object.fromEntries(themeConfig.themes.map((t) => [t.id, vars({ theme: t.id, font: themeConfig.defaults.font })])),
    fontVars: Object.fromEntries(themeConfig.fonts.map((f) => [f.id, vars({ theme: themeConfig.defaults.theme, font: f.id })])),
  };
  return data;
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Loaded only in development; the import (and the panel) is removed from production builds
  const ThemeSwitcher =
    process.env.NODE_ENV === "development" ? (await import("@/components/dev/ThemeSwitcher")).default : null;
  const themePreview = ThemeSwitcher ? JSON.stringify(themePreviewData()) : undefined;

  return (
    <html
      lang="en"
      className={`${fontVariableClasses} h-full antialiased`}
      data-theme-preview={themePreview}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script id="motion-bootstrap" src="/motion-bootstrap.js" strategy="afterInteractive" />
        {/* React Grab (react-grab.com): hover an element, press Ctrl/⌘+C to copy its component and source
            for a coding agent. Local development only; `npm run dev` copies the pinned build to public/. */}
        {process.env.NODE_ENV === "development" && (
          <Script src="/react-grab.js" crossOrigin="anonymous" strategy="afterInteractive" />
        )}
        {children}
        {ThemeSwitcher && (
          <>
            <Script id="theme-preview-bootstrap" src="/theme-preview-bootstrap.js" strategy="afterInteractive" />
            <ThemeSwitcher />
          </>
        )}
      </body>
    </html>
  );
}
