"use client";
import { useEffect, useState } from "react";

type Motif = "defiscalisation" | "energies";
type YN = "" | "oui" | "non";
type Resultat = { eligible: boolean; titre: string; message: string; detail: string; profil?: string; profilLibelle?: string };
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
const BADGE: Record<string, [string, string]> = { bleu: ["#1D4ED8", "#fff"], jaune: ["#FACC15", "#10282e"], violet: ["#7C3AED", "#fff"], rose: ["#DB2777", "#fff"] };

function YesNoSelect({ label, value, onChange, required }: { label: string; value: YN; onChange: (v: YN) => void; required?: boolean }) {
  return (
    <label>{label}{required ? " *" : ""}
      <select value={value} onChange={(e) => onChange(e.target.value as YN)}>
        <option value="">Sélectionner…</option><option value="oui">Oui</option><option value="non">Non</option>
      </select>
    </label>
  );
}

export default function Funnel() {
  const [step, setStep] = useState(1); // 1 choix · 2 coordonnées · 3 questionnaire · 4 résultat
  const [interet, setInteret] = useState("");
  const [motif, setMotif] = useState<Motif | null>(null);
  const [f, setF] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [leadId, setLeadId] = useState("");
  // Questionnaire pompe à chaleur
  const [proprio, setProprio] = useState<YN>("");
  const [surface, setSurface] = useState("");
  const [rfr, setRfr] = useState("");
  const [nbPers, setNbPers] = useState("");
  const [mpr, setMpr] = useState<YN>("");
  // Autres questionnaires
  const [facture, setFacture] = useState(2000);
  const [logement, setLogement] = useState("Maison");
  const [statut, setStatut] = useState("Propriétaire");
  const [revenu, setRevenu] = useState(50000);
  const [foyer, setFoyer] = useState("Célibataire");

  const [errs, setErrs] = useState<Record<string, string[]>>({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Resultat | null>(null);
  const pac = interet === "pompe_a_chaleur";

  // Les boutons « Vérifier / Être rappelé pour… » de la page présélectionnent le motif et passent aux coordonnées.
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail as { motif: Motif; interet: string };
      setMotif(d.motif); setInteret(d.interet); setLeadId(""); setRes(null); setMsg(""); setStep(2);
    };
    window.addEventListener("choose-motif", h);
    return () => window.removeEventListener("choose-motif", h);
  }, []);

  function pickChoice(m: Motif, i: string) { setMotif(m); setInteret(i); }

  // Étape 2 → crée le lead (conservé même si le visiteur abandonne ensuite).
  async function submitCoords(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); setErrs({});
    const required = ["prenom", "nom", "adresse", "code_postal", "ville", "telephone", ...(pac ? [] : ["email"])];
    if (required.some((k) => !(f[k] ?? "").trim())) return setMsg("Merci de remplir tous les champs obligatoires.");
    if (!consent) return setMsg("Votre accord est nécessaire pour être rappelé.");
    setBusy(true);
    try {
      const r = await fetch("/api/leads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, motif, interet, consent: true, website: hp }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.id) { setLeadId(j.id); setStep(3); }
      else { setErrs(j.fields ?? {}); setMsg(j.error ?? "Une erreur est survenue. Réessayez."); }
    } catch { setMsg("Connexion impossible. Réessayez."); }
    setBusy(false);
  }

  function buildAnswers(): Record<string, string | number> | null {
    if (pac) {
      const s = Number(surface), n = Number(nbPers), r = Number(rfr);
      if (!proprio) return fail("Indiquez si vous êtes propriétaire.");
      if (surface === "" || !Number.isFinite(s) || s < 9 || s > 2000) return fail("Indiquez une surface habitable valide (en m²).");
      if (nbPers === "" || !Number.isInteger(n) || n < 1 || n > 20) return fail("Indiquez le nombre de personnes de votre foyer fiscal.");
      if (rfr === "" || !Number.isFinite(r) || r < 0) return fail("Indiquez votre revenu fiscal de référence (sur votre avis d'imposition).");
      const a: Record<string, string | number> = { proprietaire: proprio, surface_habitable: s, personnes_foyer_fiscal: n, revenu_fiscal_reference: r };
      if (mpr) a.maprimerenov_5_ans = mpr;
      return a;
    }
    return motif === "energies" ? { logement, statut, facture_annuelle: facture } : { foyer, revenu_imposable: revenu };
  }
  function fail(m: string) { setMsg(m); return null; }

  // Étape 3 → enregistre les réponses ; le serveur calcule le profil et renvoie le message.
  async function submitAnswers() {
    setMsg("");
    const answers = buildAnswers();
    if (!answers) return;
    setBusy(true);
    try {
      const r = await fetch("/api/leads", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, answers }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.resultat) { setRes(j.resultat); setStep(4); }
      else setMsg(j.error ?? "Une erreur est survenue. Réessayez.");
    } catch { setMsg("Connexion impossible. Réessayez."); }
    setBusy(false);
  }

  const row = (k: string, v: string) => (
    <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14, padding: "9px 0", borderBottom: "1px solid var(--line)" }}>
      <span style={{ color: "var(--mut)" }}>{k}</span><span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
    </div>
  );

  if (step === 4 && res) {
    const rows: [string, string][] = [
      ["Nom", `${f.prenom ?? ""} ${f.nom ?? ""}`], ["Adresse", `${f.adresse ?? ""}, ${f.code_postal ?? ""} ${f.ville ?? ""}`], ["Téléphone", f.telephone ?? ""],
      ...(f.email ? ([["E-mail", f.email]] as [string, string][]) : []),
      ...(pac
        ? ([["Propriétaire", proprio === "oui" ? "Oui" : "Non"], ["Surface habitable", `${surface} m²`], ["Personnes du foyer fiscal", nbPers], ["Revenu fiscal de référence", eur(Number(rfr))],
            ...(mpr ? [["MaPrimeRénov' (5 ans)", mpr === "oui" ? "Oui" : "Non"]] : [])] as [string, string][])
        : motif === "energies"
        ? ([["Logement", logement], ["Statut", statut], ["Facture d'énergie annuelle", eur(facture)]] as [string, string][])
        : ([["Foyer", foyer], ["Revenu net imposable", eur(revenu)]] as [string, string][])),
    ];
    const [bg, fg] = BADGE[res.profil ?? ""] ?? ["", ""];
    return (
      <div className="card" role="status">
        <small className="mut" style={{ textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 700 }}>Demande envoyée</small>
        <h2>{res.titre}</h2>
        <div className="res"><strong>{res.message}</strong><small>{res.detail}</small></div>
        <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "6px 16px 14px", marginTop: 16 }}>
          <div style={{ fontWeight: 700, padding: "10px 0 4px" }}>Récapitulatif de votre demande</div>
          {rows.map(([k, v]) => row(k, v))}
          {res.profil && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12 }}>
              <span style={{ color: "var(--mut)", fontSize: 14 }}>Votre profil</span>
              <span style={{ background: bg, color: fg, fontWeight: 700, fontSize: 14, padding: "4px 12px", borderRadius: 999 }}>Profil {res.profil} · {res.profilLibelle}</span>
            </div>
          )}
        </div>
        <p style={{ marginBottom: 0 }}>Merci {f.prenom}. Un conseiller vous rappelle très vite au numéro indiqué.</p>
      </div>
    );
  }

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

      {step === 2 && (
        <form onSubmit={submitCoords} noValidate>
          <h2>Vos coordonnées</h2>
          <p className="mut">Pour que votre conseiller puisse vous rappeler.</p>
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
          <button className="btn" disabled={busy}>{busy ? "Envoi…" : "Continuer"}</button>
        </form>
      )}

      {step === 3 && pac && (
        <>
          <h2>Votre logement et votre foyer</h2>
          <p className="mut">Ces réponses permettent de vérifier à quelles aides vous pouvez prétendre.</p>
          <YesNoSelect label="Êtes-vous propriétaire de votre logement ?" required value={proprio} onChange={setProprio} />
          {proprio === "non" && <p className="warn">Les aides à la rénovation concernent en général les propriétaires. Un conseiller pourra vous indiquer ce qui s'applique à votre cas.</p>}
          <label>Surface habitable (m²) *
            <input type="number" inputMode="numeric" min={9} max={2000} value={surface} onChange={(e) => setSurface(e.target.value)} />
          </label>
          <label>Nombre de personnes dans le foyer fiscal *
            <input type="number" inputMode="numeric" min={1} max={20} value={nbPers} onChange={(e) => setNbPers(e.target.value)} />
          </label>
          <label>Revenu fiscal de référence (€) *
            <input type="number" inputMode="numeric" min={0} value={rfr} onChange={(e) => setRfr(e.target.value)} />
            <small className="help">Indiqué sur votre dernier avis d'imposition.</small>
          </label>
          <YesNoSelect label="Avez-vous déjà bénéficié de MaPrimeRénov' ces 5 dernières années ?" value={mpr} onChange={setMpr} />
          {msg && <p className="err" role="alert">{msg}</p>}
          <button className="btn" disabled={busy} onClick={submitAnswers}>{busy ? "Envoi…" : "Être rappelé"}</button>
        </>
      )}

      {step === 3 && !pac && motif === "energies" && (
        <>
          <h2>Votre logement</h2>
          <label>Type<select value={logement} onChange={(e) => setLogement(e.target.value)}><option>Maison</option><option>Appartement</option></select></label>
          <label>Vous êtes<select value={statut} onChange={(e) => setStatut(e.target.value)}><option>Propriétaire</option><option>Locataire</option></select></label>
          <label>Facture d'énergie annuelle : {eur(facture)}<input type="range" min={500} max={5000} step={100} value={facture} onChange={(e) => setFacture(+e.target.value)} /></label>
          {msg && <p className="err" role="alert">{msg}</p>}
          <button className="btn" disabled={busy} onClick={submitAnswers}>{busy ? "Envoi…" : "Être rappelé"}</button>
        </>
      )}

      {step === 3 && !pac && motif === "defiscalisation" && (
        <>
          <h2>Votre situation</h2>
          <label>Foyer<select value={foyer} onChange={(e) => setFoyer(e.target.value)}><option>Célibataire</option><option>En couple</option></select></label>
          <label>Revenu net imposable annuel : {eur(revenu)}<input type="range" min={20000} max={200000} step={5000} value={revenu} onChange={(e) => setRevenu(+e.target.value)} /></label>
          {msg && <p className="err" role="alert">{msg}</p>}
          <button className="btn" disabled={busy} onClick={submitAnswers}>{busy ? "Envoi…" : "Être rappelé"}</button>
        </>
      )}
    </div>
  );
}
