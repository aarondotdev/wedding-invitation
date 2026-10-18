import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes } from "next/font/google";
import { wedding } from "@/lib/wedding";
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

export const metadata: Metadata = {
  title: `${wedding.partner1} & ${wedding.partner2} — Wedding Invitation`,
  description: `Join us on ${wedding.displayDate}.`,
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
