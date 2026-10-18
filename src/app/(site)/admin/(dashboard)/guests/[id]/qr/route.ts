import QRCode from "qrcode";
import { requireAdmin } from "@/lib/auth";
import { inviteUrl } from "@/lib/guests";
import { supabaseAdmin } from "@/lib/supabase";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, { params }: RouteContext<"/admin/guests/[id]/qr">) {
  await requireAdmin();
  const { id } = await params;
  if (!UUID.test(id)) return new Response("Not found", { status: 404 });

  const { data: guest } = await supabaseAdmin()
    .from("guests")
    .select("name, code")
    .eq("id", id)
    .is("revoked_at", null)
    .maybeSingle();
  if (!guest) return new Response("Not found", { status: 404 });

  const png = await QRCode.toBuffer(inviteUrl(guest.code), { width: 600, margin: 2 });
  const fileName = `${guest.name.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "guest"}-qr.png`;

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Cache-Control": "no-store",
    },
  });
}
