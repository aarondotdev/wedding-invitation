import { requireAdmin } from "@/lib/auth";
import { guestStats, inviteUrl, listGuests } from "@/lib/guests";
import AddGuestForm from "./AddGuestForm";
import GuestRow from "./GuestRow";
import ImportPanel from "./ImportPanel";

export const instant = false;

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  );
}

export default async function AdminGuestsPage() {
  // The layout checks too, but pages must not rely on it (layouts don't re-run on every navigation).
  await requireAdmin();
  const guests = await listGuests();
  const stats = guestStats(guests);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-semibold">Guests</h1>
        <a
          href="/admin/guests/export"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
        >
          Export links (CSV)
        </a>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Invitations" value={stats.invited} />
        <Stat label="Seats offered" value={stats.seats} />
        <Stat label="Attending" value={stats.attending} />
        <Stat label="Declined" value={stats.declined} />
        <Stat label="Awaiting reply" value={stats.awaiting} />
        <Stat label="Links opened" value={stats.opened} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <AddGuestForm />
        <ImportPanel />
      </section>

      <section>
        {guests.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
            No guests yet. Add one above or import your list.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Guest</th>
                  <th className="px-3 py-2 font-medium">Party</th>
                  <th className="px-3 py-2 font-medium">RSVP</th>
                  <th className="px-3 py-2 font-medium">Link</th>
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <GuestRow key={guest.id} guest={guest} url={inviteUrl(guest.code)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
