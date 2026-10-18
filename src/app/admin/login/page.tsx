import { redirect } from "next/navigation";
import { getAdminEmail } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const instant = false;

const ERRORS: Record<string, string> = {
  "not-allowed": "That account isn't allowed to manage guests.",
  "link-invalid": "That sign-in link is invalid or has expired. Request a new code below.",
};

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdminEmail()) redirect("/admin/guests");

  const { error } = await searchParams;
  const initialError = typeof error === "string" ? ERRORS[error] : undefined;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold">Guest admin</h1>
        <p className="mb-6 text-sm text-neutral-600">Sign in with your email. No password needed.</p>
        <LoginForm initialError={initialError} />
      </div>
    </main>
  );
}
