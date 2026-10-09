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
const JOURS: [string, string][] = [["semaine", "En semaine (lundi au vendredi)"], ["samedi", "Le samedi"], ["peu_importe", "Peu importe"]];
const CRENEAUX: [string, string][] = [["matin", "Matin (9h–12h)"], ["midi", "Midi (12h–14h)"], ["apres_midi", "Après-midi (14h–18h)"], ["soir", "Soirée (18h–20h)"]];
const consentText = (pac: boolean) =>
  `J'accepte d'être contacté(e) par téléphone${pac ? "" : " et par e-mail"} par [NOM DE VOTRE SOCIÉTÉ] au sujet de ma demande, et que les informations saisies (dont mes revenus) soient utilisées pour étudier mon éligibilité. Mes données sont conservées 3 ans maximum ; je peux exercer mes droits en écrivant à [E-MAIL DPO].`;
const GRATUIT = "Ce sondage est totalement gratuit et ne vous engage à rien.";
const lib = (list: [string, string][], v: string) => list.find(([k]) => k === v)?.[1] ?? "";
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
  const [step, setStep] = useState(1); // 1 choix · 2 formulaire · 3 résultat + récapitulatif + consentement
  const [interet, setInteret] = useState("");
  const [motif, setMotif] = useState<Motif | null>(null);
  const [f, setF] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [jour, setJour] = useState("");
  const [creneau, setCreneau] = useState("");
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
  const [done, setDone] = useState(false);
  const [res, setRes] = useState<Resultat | null>(null);
  const pac = interet === "pompe_a_chaleur";

  // Les boutons « Vérifier / Être rappelé pour… » de la page présélectionnent le motif et passent au formulaire.
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail as { motif: Motif; interet: string };
      setMotif(d.motif); setInteret(d.interet); setRes(null); setDone(false); setMsg(""); setStep(2);
    };
    window.addEventListener("choose-motif", h);
    return () => window.removeEventListener("choose-motif", h);
  }, []);

  function pickChoice(m: Motif, i: string) { setMotif(m); setInteret(i); }

  function fail(m: string) { setMsg(m); return null; }
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

  async function send(consentOk: boolean, preview: boolean) {
    const answers = buildAnswers();
    if (!answers) return null;
    setBusy(true);
    try {
      const r = await fetch("/api/leads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, motif, interet, answers, rappel_jour: jour || undefined, rappel_creneau: creneau || undefined, consent: consentOk, preview, website: hp }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.resultat) { setBusy(false); return j.resultat as Resultat; }
      setErrs(j.fields ?? {}); setMsg(j.error ?? "Une erreur est survenue. Réessayez.");
    } catch { setMsg("Connexion impossible. Réessayez."); }
    setBusy(false);
    return null;
  }

  // Étape 2 → calcule le résultat côté serveur (rien n'est enregistré à ce stade).
  async function showRecap(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); setErrs({});
    const required = ["prenom", "nom", "adresse", "code_postal", "ville", "telephone", ...(pac ? [] : ["email"])];
    if (required.some((k) => !(f[k] ?? "").trim())) return setMsg("Merci de remplir tous les champs obligatoires.");
    const r = await send(false, true);
    if (r) { setRes(r); setConsent(false); setStep(3); }
  }

  // Étape 3 → le consentement donné en fin de récapitulatif finalise le sondage et enregistre la demande.
  async function finalize() {
    setMsg("");
    if (!jour || !creneau) return setMsg("Indiquez quand vous souhaitez être rappelé(e).");
    if (!consent) return setMsg("Cochez la case ci-dessus pour finaliser le sondage.");
    const r = await send(true, false);
    if (r) setDone(true);
  }

  const row = (k: string, v: string) => (
    <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14, padding: "9px 0", borderBottom: "1px solid var(--line)" }}>
      <span style={{ color: "var(--mut)" }}>{k}</span><span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
    </div>
  );

  if (step === 3 && res && done) {
    return (
      <div className="card" role="status">
        <h2>Sondage finalisé, merci {f.prenom} !</h2>
        <p>Un conseiller vous rappelle au numéro indiqué ({lib(JOURS, jour).toLowerCase()}, {lib(CRENEAUX, creneau).toLowerCase()}).</p>
        <p style={{ fontWeight: 600, marginBottom: 0 }}>✓ {GRATUIT}</p>
      </div>
    );
  }

  if (step === 3 && res) {
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
        <small className="mut" style={{ textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 700 }}>Votre résultat</small>
        <h2>{res.titre}</h2>
        <div className="res"><strong>{res.message}</strong><small>{res.detail}</small></div>
        <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "6px 16px 14px", marginTop: 16 }}>
          <div style={{ fontWeight: 700, padding: "10px 0 4px" }}>Récapitulatif de votre demande</div>
          {rows.map(([k, v]) => row(k, v))}
          {res.profil && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12 }}>
              <span style={{ color: "var(--mut)", fontSize: 14 }}>Votre profil</span>
              <span style={{ background: bg, color: fg, fontWeight: 700, fontSize: 14, padding: "4px 12px", borderRadius: 999 }}>Profil {res.profil}</span>
            </div>
          )}
        </div>
        <h3 style={{ fontSize: 16, margin: "10px 0" }}>Quand êtes-vous disponible pour être rappelé(e) ? *</h3>
            <div className="grid">
              <label>Jour
                <select value={jour} onChange={(e) => setJour(e.target.value)}>
                  <option value="">Sélectionner…</option>{JOURS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </label>
              <label>Créneau
                <select value={creneau} onChange={(e) => setCreneau(e.target.value)}>
                  <option value="">Sélectionner…</option>{CRENEAUX.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </label>
            </div>
        <label className="chk" style={{ marginTop: 16 }}><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>{consentText(pac)}</span></label>
        {msg && <p className="err" role="alert">{msg}</p>}
        <button className="btn" disabled={busy} onClick={finalize}>{busy ? "Envoi…" : "Envoyer"}</button>
        <button type="button" onClick={() => { setMsg(""); setStep(2); }} style={{ display: "block", margin: "12px auto 0", background: "none", border: 0, color: "var(--mut)", textDecoration: "underline", cursor: "pointer", font: "inherit", fontSize: 14 }}>Modifier mes réponses</button>
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
        <form onSubmit={showRecap} noValidate>
          <h2>{pac ? "Vérifiez votre éligibilité" : "Votre étude gratuite"}</h2>
          <p className="mut">{pac ? "Quelques questions pour savoir si vous pouvez bénéficier de l'offre pompe à chaleur. Un conseiller vous rappelle ensuite." : "Remplissez ce formulaire : un conseiller vous rappelle ensuite."}</p>
          <p className="mut" style={{ fontWeight: 600 }}>✓ {GRATUIT}</p>
          <h3 style={{ fontSize: 16, margin: "6px 0 10px" }}>Vos coordonnées</h3>
          <div className="grid">
            {FIELDS.map(([k, label, ac, type]) => (
              <label key={k} className={k === "adresse" ? "full" : ""}>{label}{k === "email" && pac ? " (facultatif)" : " *"}
                <input name={k} type={type} autoComplete={ac} required value={f[k] ?? ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={!!errs[k]} />
                {errs[k] && <span className="err">Valeur invalide</span>}
              </label>
            ))}
          </div>

          {pac && (
            <>
              <h3 style={{ fontSize: 16, margin: "10px 0" }}>Votre logement et votre foyer</h3>
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
            </>
          )}
          {!pac && motif === "energies" && (
            <>
              <h3 style={{ fontSize: 16, margin: "10px 0" }}>Votre logement</h3>
              <label>Type<select value={logement} onChange={(e) => setLogement(e.target.value)}><option>Maison</option><option>Appartement</option></select></label>
              <label>Vous êtes<select value={statut} onChange={(e) => setStatut(e.target.value)}><option>Propriétaire</option><option>Locataire</option></select></label>
              <label>Facture d'énergie annuelle : {eur(facture)}<input type="range" min={500} max={5000} step={100} value={facture} onChange={(e) => setFacture(+e.target.value)} /></label>
            </>
          )}
          {!pac && motif === "defiscalisation" && (
            <>
              <h3 style={{ fontSize: 16, margin: "10px 0" }}>Votre situation</h3>
              <label>Foyer<select value={foyer} onChange={(e) => setFoyer(e.target.value)}><option>Célibataire</option><option>En couple</option></select></label>
              <label>Revenu net imposable annuel : {eur(revenu)}<input type="range" min={20000} max={200000} step={5000} value={revenu} onChange={(e) => setRevenu(+e.target.value)} /></label>
            </>
          )}

          <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden value={hp} onChange={(e) => setHp(e.target.value)} name="website" />
          {msg && <p className="err" role="alert">{msg}</p>}
          <button className="btn" disabled={busy}>{busy ? "Calcul…" : "Voir mon résultat"}</button>
        </form>
      )}
    </div>
  );
}
