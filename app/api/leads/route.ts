import { NextResponse } from "next/server";
import { CONSENT_VERSION, leadSchema, normalizePhone } from "@/lib/schema";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Certains champs sont invalides.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const { website, consent: _c, telephone, ...d } = parsed.data;
  if (website) return NextResponse.json({ ok: true }); // champ piège : on ignore les robots

  const { error } = await supabaseAdmin().from("leads").insert({
    ...d,
    telephone: normalizePhone(telephone),
    consent_at: new Date().toISOString(),
    consent_version: CONSENT_VERSION,
  });
  if (error) {
    console.error("insert lead:", error.message);
    return NextResponse.json({ error: "Enregistrement impossible. Réessayez dans un instant." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
