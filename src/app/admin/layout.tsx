import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guest admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex flex-1 flex-col bg-white font-sans text-[15px]">{children}</div>;
}
