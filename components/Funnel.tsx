"use client";
import { useEffect, useState } from "react";
import { estimateEnergies } from "@/lib/estimate";

type Motif = "defiscalisation" | "energies";
type YN = "" | "oui" | "non";
const eur = (n: number) => n.toLocaleString("fr-FR") + " €";
const FIELDS: [string, string, string, string][] = [
  ["prenom", "Prénom", "given-name", "text"],
  ["nom", "Nom", "family-name", "text"],
  ["adresse", "Adresse", "street-address", "text"],
  ["code_postal", "Code postal", "postal-code", "text"],
  ["ville", "Ville", "address-level2", "text"],
  ["email", "E-mail", "email", "email"],
  ["telephone", "Téléphone", "tel", "tel"],
];
const CHOICES: [string, Motif, string, string][] = [
  ["pac", "energies", "pompe_a_chaleur", "Pompe à chaleur : vérifier mon éligibilité aux aides"],
  ["solaire", "energies", "solaire", "Panneaux solaires"],
  ["defisc", "defiscalisation", "defiscalisation", "Défiscalisation"],
];

function YesNo({ label, value, onChange, required }: { label: string; value: YN; onChange: (v: YN) => void; required?: boolean }) {
  return (
    <div className="q" role="group" aria-label={label}>
      <span>{label}{required ? " *" : ""}</span>
      <div className="choices two" style={{ marginBottom: 0 }}>
        {(["oui", "non"] as const).map((v) => (
          <button key={v} type="button" aria-pressed={value === v} className={"choice" + (value === v ? " on" : "")} onClick={() => onChange(v)}>{v === "oui" ? "Oui" : "Non"}</button>
        ))}
      </div>
    </div>
  );
}

export default function Funnel() {
  const [step, setStep] = useState(1);
  const [interet, setInteret] = useState("");
  const [motif, setMotif] = useState<Motif | null>(null);
  const [facture, setFacture] = useState(2000);
  const [logement, setLogement] = useState("Maison");
  const [statut, setStatut] = useState("Propriétaire");
  const [revenu, setRevenu] = useState(50000);
  const [foyer, setFoyer] = useState("Célibataire");
  // Questionnaire pompe à chaleur
  const [proprio, setProprio] = useState<YN>("");
  const [surface, setSurface] = useState("");
  const [rfr, setRfr] = useState("");
  const [nbPers, setNbPers] = useState("");
  const [mpr, setMpr] = useState<YN>("");
  const [pacErr, setPacErr] = useState("");

  const [f, setF] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [errs, setErrs] = useState<Record<string, string[]>>({});
  const [msg, setMsg] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const pac = interet === "pompe_a_chaleur";

  // Les boutons « Vérifier / Être rappelé pour… » de la page présélectionnent le motif et passent à l'étape 2.
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail as { motif: Motif; interet: string };
      setMotif(d.motif); setInteret(d.interet); setStep(2); setState("idle");
    };
    window.addEventListener("choose-motif", h);
    return () => window.removeEventListener("choose-motif", h);
  }, []);

  function pickChoice(m: Motif, i: string) { setMotif(m); setInteret(i); }

  function nextFromPac() {
    const s = Number(surface);
    if (!proprio) return setPacErr("Indiquez si vous êtes propriétaire.");
    if (!Number.isFinite(s) || s < 9 || s > 2000) return setPacErr("Indiquez une surface habitable valide (en m²).");
    setPacErr(""); setStep(3);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); setErrs({});
    const required = ["prenom", "nom", "adresse", "code_postal", "ville", "telephone", ...(pac ? [] : ["email"])];
    if (required.some((k) => !(f[k] ?? "").trim())) { setMsg("Merci de remplir tous les champs obligatoires."); return; }
    if (!consent) { setMsg("Votre accord est nécessaire pour être rappelé."); return; }
    setState("sending");
    let simulation: Record<string, string | number>;
    if (pac) {
      simulation = { interet, proprietaire: proprio, surface_habitable: Number(surface) };
      if (rfr) simulation.revenu_fiscal_reference = Number(rfr);
      if (nbPers) simulation.personnes_foyer_fiscal = Number(nbPers);
      if (mpr) simulation.maprimerenov_5_ans = mpr;
    } else if (motif === "energies") simulation = { logement, statut, facture_annuelle: facture, interet };
    else simulation = { foyer, revenu_imposable: revenu, interet };
    try {
      const r = await fetch("/api/leads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, motif, consent: true, simulation, website: hp }),
      });
      if (r.ok) { setState("done"); return; }
      const j = await r.json().catch(() => ({}));
      setErrs(j.fields ?? {}); setMsg(j.error ?? "Une erreur est survenue. Réessayez.");
    } catch { setMsg("Connexion impossible. Réessayez."); }
    setState("idle");
  }

  if (state === "done")
    return (<div className="card" role="status"><h2>Demande envoyée</h2><p>Merci {f.prenom}. Un conseiller vous rappelle très vite pour vérifier votre situation avec vous.</p></div>);

  return (
    <div className="card">
      <div className="prog"><i style={{ width: `${step * 33.3}%` }} /></div>

      {step === 1 && (
        <>
          <h2>Simulez votre situation</h2>
          <p className="mut">Que souhaitez-vous étudier ?</p>
          <div className="choices">
            {CHOICES.map(([k, m, i, l]) => (
              <button key={k} type="button" aria-pressed={interet === i} className={"choice" + (interet === i ? " on" : "")} onClick={() => pickChoice(m, i)}>{l}</button>
            ))}
          </div>
          <button className="btn" disabled={!motif} onClick={() => setStep(2)}>Continuer</button>
        </>
      )}

      {step === 2 && pac && (
        <>
          <h2>Votre logement et votre foyer</h2>
          <p className="mut">Ces réponses permettent de vérifier à quelles aides vous pouvez prétendre.</p>
          <YesNo label="Êtes-vous propriétaire de votre logement ?" required value={proprio} onChange={setProprio} />
          {proprio === "non" && <p className="warn">Les aides à la rénovation concernent en général les propriétaires. Un conseiller pourra vous indiquer ce qui s'applique à votre cas.</p>}
          <label>Surface habitable (m²) *
            <input type="number" inputMode="numeric" min={9} max={2000} value={surface} onChange={(e) => setSurface(e.target.value)} />
          </label>
          <label>Nombre de personnes dans le foyer fiscal
            <input type="number" inputMode="numeric" min={1} max={20} value={nbPers} onChange={(e) => setNbPers(e.target.value)} />
          </label>
          <label>Revenu fiscal de référence (€)
            <input type="number" inputMode="numeric" min={0} value={rfr} onChange={(e) => setRfr(e.target.value)} />
            <small className="help">Indiqué sur votre dernier avis d'imposition.</small>
          </label>
          <YesNo label="Avez-vous déjà bénéficié de MaPrimeRénov' ces 5 dernières années ?" value={mpr} onChange={setMpr} />
          {pacErr && <p className="err" role="alert">{pacErr}</p>}
          <button className="btn" onClick={nextFromPac}>Continuer</button>
        </>
      )}

      {step === 2 && !pac && motif === "energies" && (
        <>
          <h2>Votre logement</h2>
          <label>Type<select value={logement} onChange={(e) => setLogement(e.target.value)}><option>Maison</option><option>Appartement</option></select></label>
          <label>Vous êtes<select value={statut} onChange={(e) => setStatut(e.target.value)}><option>Propriétaire</option><option>Locataire</option></select></label>
          <label>Facture d'énergie annuelle : {eur(facture)}<input type="range" min={500} max={5000} step={100} value={facture} onChange={(e) => setFacture(+e.target.value)} /></label>
          <button className="btn" onClick={() => setStep(3)}>Voir mon estimation</button>
        </>
      )}

      {step === 2 && !pac && motif === "defiscalisation" && (
        <>
          <h2>Votre situation</h2>
          <label>Foyer<select value={foyer} onChange={(e) => setFoyer(e.target.value)}><option>Célibataire</option><option>En couple</option></select></label>
          <label>Revenu net imposable annuel : {eur(revenu)}<input type="range" min={20000} max={200000} step={5000} value={revenu} onChange={(e) => setRevenu(+e.target.value)} /></label>
          <button className="btn" onClick={() => setStep(3)}>Voir mon estimation</button>
        </>
      )}

      {step === 3 && (
        <form onSubmit={submit} noValidate>
          {pac ? (
            <div className="res"><small>Dernière étape</small><strong>Un conseiller vérifie votre éligibilité avec vous</strong></div>
          ) : (
            <div className="res">
              <small>Estimation indicative</small>
              <strong>{motif === "energies" ? `${eur(estimateEnergies(facture).min)} à ${eur(estimateEnergies(facture).max)} d'économies par an` : "Plusieurs dispositifs peuvent vous concerner"}</strong>
            </div>
          )}
          <h2>{pac ? "Vos coordonnées" : "Recevez votre étude gratuite"}</h2>
          <div className="grid">
            {FIELDS.map(([k, label, ac, type]) => (
              <label key={k} className={k === "adresse" ? "full" : ""}>{label}{k === "email" && pac ? " (facultatif)" : " *"}
                <input name={k} type={type} autoComplete={ac} required value={f[k] ?? ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={!!errs[k]} />
                {errs[k] && <span className="err">Valeur invalide</span>}
              </label>
            ))}
          </div>
          <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden value={hp} onChange={(e) => setHp(e.target.value)} name="website" />
          <label className="chk"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>J'accepte d'être contacté(e) par téléphone{pac ? "" : " et par e-mail"} par [NOM DE VOTRE SOCIÉTÉ] au sujet de ma demande, et que les informations saisies (dont mes revenus) soient utilisées pour étudier mon éligibilité. Mes données sont conservées 3 ans maximum ; je peux exercer mes droits en écrivant à [E-MAIL DPO].</span></label>
          {msg && <p className="err" role="alert">{msg}</p>}
          <button className="btn" disabled={state === "sending"}>{state === "sending" ? "Envoi…" : "Être rappelé"}</button>
        </form>
      )}
    </div>
  );
}
