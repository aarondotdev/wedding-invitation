import { requireAdmin } from "@/lib/auth";
import { toCsv } from "@/lib/guests";

export async function GET() {
  await requireAdmin();

  const csv = toCsv([
    ["name", "party_size", "phone", "email", "notes"],
    ["Maria & Jose Santos", 2, "+639171234567", "maria@example.com", "Bride's aunt"],
  ]);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="guest-list-template.csv"',
      "Cache-Control": "no-store",
    },
  });
}
