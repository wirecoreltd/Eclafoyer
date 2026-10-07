"use client";
import { useEffect, useState } from "react";
import { estimateEnergies } from "@/lib/estimate";

type Motif = "defiscalisation" | "energies";
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

export default function Funnel() {
  const [step, setStep] = useState(1);
  const [interet, setInteret] = useState("");
  const [motif, setMotif] = useState<Motif | null>(null);
  const [facture, setFacture] = useState(2000);
  const [logement, setLogement] = useState("Maison");
  const [statut, setStatut] = useState("Propriétaire");
  const [revenu, setRevenu] = useState(50000);
  const [foyer, setFoyer] = useState("Célibataire");
  const [f, setF] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [errs, setErrs] = useState<Record<string, string[]>>({});
  const [msg, setMsg] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  // Les boutons « Être rappelé pour… » de la page présélectionnent le motif et passent à l'étape 2.
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail as { motif: Motif; interet: string };
      setMotif(d.motif); setInteret(d.interet); setStep(2); setState("idle");
    };
    window.addEventListener("choose-motif", h);
    return () => window.removeEventListener("choose-motif", h);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); setErrs({});
    if (!consent) { setMsg("Votre accord est nécessaire pour être rappelé."); return; }
    setState("sending");
    const simulation = motif === "energies"
      ? { logement, statut, facture_annuelle: facture, interet }
      : { foyer, revenu_imposable: revenu, interet };
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
    return (<div className="card" role="status"><h2>Demande envoyée</h2><p>Merci {f.prenom}. Un conseiller vous rappelle très vite.</p></div>);

  return (
    <div className="card">
      <div className="prog"><i style={{ width: `${step * 33.3}%` }} /></div>

      {step === 1 && (
        <>
          <h2>Simulez votre situation</h2>
          <p className="mut">Que souhaitez-vous étudier ?</p>
          <div className="choices">
            {([["defiscalisation", "Défiscalisation"], ["energies", "Énergies renouvelables"]] as [Motif, string][]).map(([v, l]) => (
              <button key={v} type="button" aria-pressed={motif === v} className={"choice" + (motif === v ? " on" : "")} onClick={() => setMotif(v)}>{l}</button>
            ))}
          </div>
          <button className="btn" disabled={!motif} onClick={() => setStep(2)}>Continuer</button>
        </>
      )}

      {step === 2 && motif === "energies" && (
        <>
          <h2>Votre logement</h2>
          <label>Type<select value={logement} onChange={(e) => setLogement(e.target.value)}><option>Maison</option><option>Appartement</option></select></label>
          <label>Vous êtes<select value={statut} onChange={(e) => setStatut(e.target.value)}><option>Propriétaire</option><option>Locataire</option></select></label>
          <label>Facture d'énergie annuelle : {eur(facture)}<input type="range" min={500} max={5000} step={100} value={facture} onChange={(e) => setFacture(+e.target.value)} /></label>
          <button className="btn" onClick={() => setStep(3)}>Voir mon estimation</button>
        </>
      )}

      {step === 2 && motif === "defiscalisation" && (
        <>
          <h2>Votre situation</h2>
          <label>Foyer<select value={foyer} onChange={(e) => setFoyer(e.target.value)}><option>Célibataire</option><option>En couple</option></select></label>
          <label>Revenu net imposable annuel : {eur(revenu)}<input type="range" min={20000} max={200000} step={5000} value={revenu} onChange={(e) => setRevenu(+e.target.value)} /></label>
          <button className="btn" onClick={() => setStep(3)}>Voir mon estimation</button>
        </>
      )}

      {step === 3 && (
        <form onSubmit={submit} noValidate>
          <div className="res">
            <small>Estimation indicative</small>
            <strong>{motif === "energies" ? `${eur(estimateEnergies(facture).min)} à ${eur(estimateEnergies(facture).max)} d'économies par an` : "Plusieurs dispositifs peuvent vous concerner"}</strong>
          </div>
          <h2>Recevez votre étude gratuite</h2>
          <div className="grid">
            {FIELDS.map(([k, label, ac, type]) => (
              <label key={k} className={k === "adresse" ? "full" : ""}>{label}
                <input name={k} type={type} autoComplete={ac} required value={f[k] ?? ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={!!errs[k]} />
                {errs[k] && <span className="err">Valeur invalide</span>}
              </label>
            ))}
          </div>
          <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden value={hp} onChange={(e) => setHp(e.target.value)} name="website" />
          <label className="chk"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>J'accepte d'être contacté(e) par téléphone et par e-mail par [NOM DE VOTRE SOCIÉTÉ] au sujet de ma demande. Mes données sont conservées 3 ans maximum ; je peux exercer mes droits en écrivant à [E-MAIL DPO].</span></label>
          {msg && <p className="err" role="alert">{msg}</p>}
          <button className="btn" disabled={state === "sending"}>{state === "sending" ? "Envoi…" : "Être rappelé"}</button>
        </form>
      )}
    </div>
  );
}
