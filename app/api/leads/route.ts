import { NextResponse } from "next/server";
import { CONSENT_VERSION, answersSchemas, completeSchema, leadSchema, normalizePhone, INTERETS } from "@/lib/schema";
import { RESULTAT_GENERIQUE, evaluerPac, type Resultat } from "@/lib/profil";
import { supabaseAdmin } from "@/lib/supabase";

async function readJson(req: Request) {
  try { return await req.json(); } catch { return undefined; }
}

// Étape 2 : crée le lead dès les coordonnées (le lead est conservé même si le visiteur abandonne ensuite).
export async function POST(req: Request) {
  const body = await readJson(req);
  if (body === undefined) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Certains champs sont invalides.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const { website, consent: _c, telephone, interet, ...d } = parsed.data;
  if (website) return NextResponse.json({ ok: true, id: crypto.randomUUID() }); // champ piège : on ignore les robots

  const { data, error } = await supabaseAdmin().from("leads").insert({
    ...d,
    email: d.email || null,
    telephone: normalizePhone(telephone),
    simulation: { interet },
    consent_at: new Date().toISOString(),
    consent_version: CONSENT_VERSION,
  }).select("id").single();
  if (error || !data) {
    console.error("insert lead:", error?.message);
    return NextResponse.json({ error: "Enregistrement impossible. Réessayez dans un instant." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}

// Étape 3 : enregistre les réponses, calcule le profil côté serveur et renvoie uniquement le message à afficher.
export async function PATCH(req: Request) {
  const body = await readJson(req);
  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  const { id, answers } = parsed.data;

  const db = supabaseAdmin();
  const { data: lead } = await db.from("leads").select("code_postal, simulation, simulation_completed_at").eq("id", id).maybeSingle();
  if (!lead) return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
  if (lead.simulation_completed_at) return NextResponse.json({ error: "Demande déjà complétée." }, { status: 409 });

  const interet = lead.simulation?.interet as (typeof INTERETS)[number] | undefined;
  if (!interet || !(interet in answersSchemas)) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  const a = answersSchemas[interet].safeParse(answers);
  if (!a.success) return NextResponse.json({ error: "Certaines réponses sont invalides." }, { status: 422 });

  let simulation: Record<string, string | number> = { interet, ...(a.data as Record<string, string | number>) };
  let resultat: Resultat = RESULTAT_GENERIQUE;
  if (interet === "pompe_a_chaleur") {
    const p = a.data as { proprietaire: "oui" | "non"; revenu_fiscal_reference: number; personnes_foyer_fiscal: number };
    const ev = evaluerPac({ rfr: p.revenu_fiscal_reference, personnes: p.personnes_foyer_fiscal, codePostal: lead.code_postal, proprietaire: p.proprietaire });
    simulation = { ...simulation, zone: ev.zone, profil_maprimerenov: ev.profil, eligible_pac_1_euro: ev.resultat.eligible ? "oui" : "non" };
    resultat = ev.resultat;
  }

  const { error } = await db.from("leads").update({ simulation, simulation_completed_at: new Date().toISOString() }).eq("id", id).is("simulation_completed_at", null);
  if (error) {
    console.error("update lead:", error.message);
    return NextResponse.json({ error: "Enregistrement impossible. Réessayez dans un instant." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, resultat });
}
