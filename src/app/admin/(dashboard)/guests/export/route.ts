import { requireAdmin } from "@/lib/auth";
import { inviteUrl, listGuests, toCsv } from "@/lib/guests";

export async function GET() {
  await requireAdmin();
  const guests = (await listGuests()).filter((g) => !g.revoked_at);

  const csv = toCsv([
    ["name", "phone", "email", "party_size", "url"],
    ...guests.map((g) => [g.name, g.phone, g.email, g.party_size, inviteUrl(g.code)]),
  ]);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="links.csv"',
      "Cache-Control": "no-store",
    },
  });
}
