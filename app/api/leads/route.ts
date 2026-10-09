import { NextResponse } from "next/server";
import { CONSENT_VERSION, answersSchemas, leadSchema, normalizePhone } from "@/lib/schema";
import { RESULTAT_GENERIQUE, evaluerPac, type Resultat } from "@/lib/profil";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Certains champs sont invalides.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const { website, consent: _c, telephone, interet, answers, rappel_jour, rappel_creneau, ...d } = parsed.data;
  if (website) return NextResponse.json({ ok: true, resultat: RESULTAT_GENERIQUE }); // champ piège : on ignore les robots

  const a = answersSchemas[interet].safeParse(answers);
  if (!a.success) return NextResponse.json({ error: "Certaines réponses sont invalides." }, { status: 422 });

  // Le profil est calculé côté serveur : les barèmes ne sont jamais envoyés au navigateur.
  let simulation: Record<string, string | number> = { interet, ...(a.data as Record<string, string | number>), rappel_jour, rappel_creneau };
  let resultat: Resultat = RESULTAT_GENERIQUE;
  if (interet === "pompe_a_chaleur") {
    const p = a.data as { proprietaire: "oui" | "non"; revenu_fiscal_reference: number; personnes_foyer_fiscal: number };
    const ev = evaluerPac({ rfr: p.revenu_fiscal_reference, personnes: p.personnes_foyer_fiscal, codePostal: d.code_postal, proprietaire: p.proprietaire });
    simulation = { ...simulation, zone: ev.zone, profil_maprimerenov: ev.profil, eligible_pac_1_euro: ev.resultat.eligible ? "oui" : "non" };
    resultat = ev.resultat;
  }

  const { error } = await supabaseAdmin().from("leads").insert({
    ...d,
    email: d.email || null,
    telephone: normalizePhone(telephone),
    simulation,
    consent_at: new Date().toISOString(),
    consent_version: CONSENT_VERSION,
  });
  if (error) {
    console.error("insert lead:", error.message);
    return NextResponse.json({ error: "Enregistrement impossible. Réessayez dans un instant." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, resultat });
}
