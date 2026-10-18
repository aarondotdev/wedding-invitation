import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { getSeo } from "@/lib/site-content";
import { PREVIEW_STORAGE_KEY, scopeVariables } from "@/theme/apply";
import { themeConfig } from "@/theme/config";
import { fontVariableClasses } from "@/theme/fonts";
import "./globals.css";

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
  themeColor: "#ffffff",
};

// Development only: re-apply a saved theme preview (from the dev theme switcher) to the guest page
// before it paints, so reloading doesn't flash the default look first.
function themePreviewBootstrap() {
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
  return `(function(d){try{var s=JSON.parse(localStorage.getItem(d.key)||"null");if(!s)return;var sel={};for(var k in d.defaults){sel[k]=d.ids[k].indexOf(s[k])>=0?s[k]:d.defaults[k]}var v=Object.assign({},d.themeVars[sel.theme]);var f=d.fontVars[sel.font];["--font-display","--font-sans","--font-script"].forEach(function(n){v[n]=f[n]});document.querySelectorAll("[data-theme-scope]").forEach(function(el){for(var k in sel)el.setAttribute("data-"+k,sel[k]);for(var n in v)el.style.setProperty(n,v[n])})}catch(e){}})(${JSON.stringify(data)})`;
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Loaded only in development; the import (and the panel) is removed from production builds
  const ThemeSwitcher =
    process.env.NODE_ENV === "development" ? (await import("@/components/dev/ThemeSwitcher")).default : null;

  return (
    <html
      lang="en"
      className={`${fontVariableClasses} h-full antialiased`}
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
      <body className="min-h-full flex flex-col">
        {children}
        {ThemeSwitcher && (
          <>
            <script dangerouslySetInnerHTML={{ __html: themePreviewBootstrap() }} />
            <ThemeSwitcher />
          </>
        )}
      </body>
    </html>
  );
}
