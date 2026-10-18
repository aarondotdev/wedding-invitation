import { signOut } from "@/app/(site)/admin/login/actions";
import { requireAdmin } from "@/lib/auth";
import { getWedding } from "@/lib/wedding";

// Reads the session cookie on every request; nothing here can be prerendered or cached.
export const instant = false;

export default async function DashboardLayout({ children }: LayoutProps<"/admin">) {
  const email = await requireAdmin();
  const wedding = await getWedding();

  return (
    <>
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <p className="font-semibold">
            {wedding.partner1} &amp; {wedding.partner2}{" "}
            <span className="font-normal text-neutral-500">· Guest admin</span>
          </p>
          <form action={signOut} className="flex items-center gap-3 text-sm text-neutral-600">
            <span className="hidden sm:inline">{email}</span>
            <button type="submit" className="rounded-md border border-neutral-300 px-3 py-1 hover:bg-neutral-50">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</div>
    </>
  );
}
