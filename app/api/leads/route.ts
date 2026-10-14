import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { CONSENT_VERSION, leadSchema, normalizePhone } from "@/lib/schema";
import { RESULTAT_GENERIQUE, SURFACES, TRANCHES_REVENU, evaluerPac } from "@/lib/profil";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Certains champs sont invalides.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const { website, consent: _c, preview, telephone, answers, rappel_date, rappel_heure, ...d } = parsed.data;
  if (website) return NextResponse.json({ ok: true, resultat: RESULTAT_GENERIQUE }); // champ piège : on ignore les robots

  // Le profil est calculé côté serveur : les barèmes ne sont jamais envoyés au navigateur.
  const tranche = answers.revenu_tranche !== undefined ? TRANCHES_REVENU[answers.revenu_tranche] : undefined;
  const ev = evaluerPac({
    rfr: answers.revenu_fiscal_reference ?? tranche!.rfr,
    personnes: answers.personnes_foyer_fiscal,
    codePostal: d.code_postal,
    proprietaire: answers.proprietaire,
  });

  // Aperçu (non utilisé par le formulaire actuel) : on calcule sans enregistrer.
  if (preview) return NextResponse.json({ ok: true, resultat: ev.resultat });

  // « Voir mon résultat » : toutes les données sont enregistrées ici (le consentement est coché juste avant).
  // Le créneau de rappel est ajouté ensuite, via /api/leads/rappel, grâce au jeton renvoyé ci-dessous.
  const token = randomUUID();
  const simulation: Record<string, unknown> = {
    interet: "pompe_a_chaleur",
    ...answers,
    ...(tranche ? { revenu_tranche: tranche.label } : {}),
    ...(answers.surface_tranche !== undefined ? { surface_tranche: SURFACES[answers.surface_tranche] } : {}),
    zone: ev.zone,
    profil_maprimerenov: ev.profil,
    eligible_pac_1_euro: ev.resultat.eligible ? "oui" : "non",
    rappel_date,
    rappel_heure,
    rappel_token: token,
  };

  const { data, error } = await supabaseAdmin().from("leads").insert({
    ...d,
    motif: "energies",
    email: d.email || null,
    telephone: normalizePhone(telephone),
    simulation,
    consent_at: new Date().toISOString(),
    consent_version: CONSENT_VERSION,
  }).select("id").single();
  if (error || !data) {
    console.error("insert lead:", error?.message);
    return NextResponse.json({ error: "Enregistrement impossible. Réessayez dans un instant." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, resultat: ev.resultat, id: data.id, token });
}
