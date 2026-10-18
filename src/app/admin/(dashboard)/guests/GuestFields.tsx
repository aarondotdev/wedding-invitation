import type { AdminGuest } from "@/lib/guests";

export const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

export const primaryButton =
  "rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60";

// Shared by the add and edit forms.
export default function GuestFields({ guest }: { guest?: AdminGuest }) {
  return (
    <div className="grid gap-3 sm:grid-cols-6">
      <label className="sm:col-span-4">
        <span className="mb-1 block text-xs font-medium text-neutral-600">Name (as shown on the invitation)</span>
        <input name="name" required maxLength={200} defaultValue={guest?.name} placeholder="Maria & Jose Santos" className={inputClass} />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-1 block text-xs font-medium text-neutral-600">Party size</span>
        <input name="party_size" type="number" min={1} max={20} required defaultValue={guest?.party_size ?? 1} className={inputClass} />
      </label>
      <label className="sm:col-span-3">
        <span className="mb-1 block text-xs font-medium text-neutral-600">Phone</span>
        <input name="phone" maxLength={50} defaultValue={guest?.phone ?? ""} className={inputClass} />
      </label>
      <label className="sm:col-span-3">
        <span className="mb-1 block text-xs font-medium text-neutral-600">Email</span>
        <input name="email" type="email" maxLength={320} defaultValue={guest?.email ?? ""} className={inputClass} />
      </label>
      <label className="sm:col-span-6">
        <span className="mb-1 block text-xs font-medium text-neutral-600">Private notes</span>
        <input name="notes" maxLength={1000} defaultValue={guest?.notes ?? ""} placeholder="Only visible here" className={inputClass} />
      </label>
    </div>
  );
}
