"use client";
import { useState } from "react";

type YN = "" | "oui" | "non";
type Resultat = { eligible: boolean; titre: string; message: string; detail: string; profil?: string };
const eur = (n: number) => n.toLocaleString("fr-FR") + " €";
const FIELDS: [string, string, string, string][] = [
  ["prenom", "Prénom", "given-name", "text"],
  ["nom", "Nom", "family-name", "text"],
  ["adresse", "Adresse", "street-address", "text"],
  ["code_postal", "Code postal", "postal-code", "text"],
  ["ville", "Ville", "address-level2", "text"],
  ["email", "E-mail (facultatif)", "email", "email"],
  ["telephone", "Téléphone", "tel", "tel"],
];
const CONSENT =
  "J'accepte d'être contacté(e) par téléphone par [NOM DE VOTRE SOCIÉTÉ] au sujet de ma demande, et que les informations saisies (dont mes revenus) soient utilisées pour étudier mon éligibilité. Mes données sont conservées 3 ans maximum ; je peux exercer mes droits en écrivant à [E-MAIL DPO].";
const GRATUIT = "Ce sondage est totalement gratuit et ne vous engage à rien.";
const HEURES = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const heureLabel = (h: string) => h.replace(":", "h");
const dateLabel = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const BADGE: Record<string, [string, string]> = { bleu: ["#1D4ED8", "#fff"], jaune: ["#FACC15", "#10242C"], violet: ["#7C3AED", "#fff"], rose: ["#DB2777", "#fff"] };

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
  const [step, setStep] = useState(1); // 1 formulaire · 2 résultat + récapitulatif + consentement
  const [f, setF] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const [proprio, setProprio] = useState<YN>("");
  const [surface, setSurface] = useState("");
  const [rfr, setRfr] = useState("");
  const [nbPers, setNbPers] = useState("");
  const [mpr, setMpr] = useState<YN>("");
  const [errs, setErrs] = useState<Record<string, string[]>>({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [res, setRes] = useState<Resultat | null>(null);

  function fail(m: string) { setMsg(m); return null; }
  function buildAnswers(): Record<string, string | number> | null {
    const s = Number(surface), n = Number(nbPers), r = Number(rfr);
    if (!proprio) return fail("Indiquez si vous êtes propriétaire.");
    if (surface === "" || !Number.isFinite(s) || s < 9 || s > 2000) return fail("Indiquez une surface habitable valide (en m²).");
    if (nbPers === "" || !Number.isInteger(n) || n < 1 || n > 20) return fail("Indiquez le nombre de personnes de votre foyer fiscal.");
    if (rfr === "" || !Number.isFinite(r) || r < 0) return fail("Indiquez votre revenu fiscal de référence (sur votre avis d'imposition).");
    const a: Record<string, string | number> = { proprietaire: proprio, surface_habitable: s, personnes_foyer_fiscal: n, revenu_fiscal_reference: r };
    if (mpr) a.maprimerenov_5_ans = mpr;
    return a;
  }

  async function send(consentOk: boolean, preview: boolean) {
    const answers = buildAnswers();
    if (!answers) return null;
    setBusy(true);
    try {
      const r = await fetch("/api/leads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, answers, rappel_date: date || undefined, rappel_heure: heure || undefined, consent: consentOk, preview, website: hp }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.resultat) { setBusy(false); return j.resultat as Resultat; }
      setErrs(j.fields ?? {}); setMsg(j.error ?? "Une erreur est survenue. Réessayez.");
    } catch { setMsg("Connexion impossible. Réessayez."); }
    setBusy(false);
    return null;
  }

  // Étape 1 → le serveur calcule le résultat (rien n'est enregistré à ce stade).
  async function showRecap(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); setErrs({});
    const required = ["prenom", "nom", "adresse", "code_postal", "ville", "telephone"];
    if (required.some((k) => !(f[k] ?? "").trim())) return setMsg("Merci de remplir tous les champs obligatoires.");
    const r = await send(false, true);
    if (r) { setRes(r); setConsent(false); setStep(2); }
  }

  // Étape 2 → le consentement donné en fin de récapitulatif finalise le sondage et enregistre la demande.
  async function finalize() {
    setMsg("");
    if (!date || !heure) return setMsg("Choisissez la date et l'heure de votre rappel.");
    if (!consent) return setMsg("Cochez la case ci-dessus pour finaliser le sondage.");
    const r = await send(true, false);
    if (r) { setDone(true); setErrs({}); }
  }

  if (step === 2 && res && done) {
    return (
      <div className="card" role="status">
        <h2>Sondage finalisé, merci {f.prenom} !</h2>
        <p>Un conseiller vous rappelle au numéro indiqué le {dateLabel(date)} à {heureLabel(heure)}.</p>
        <p className="strong">✓ {GRATUIT}</p>
      </div>
    );
  }

  if (step === 2 && res) {
    const rows: [string, string][] = [
      ["Nom", `${f.prenom ?? ""} ${f.nom ?? ""}`],
      ["Adresse", `${f.adresse ?? ""}, ${f.code_postal ?? ""} ${f.ville ?? ""}`],
      ["Téléphone", f.telephone ?? ""],
      ...(f.email ? ([["E-mail", f.email]] as [string, string][]) : []),
      ["Propriétaire", proprio === "oui" ? "Oui" : "Non"],
      ["Surface habitable", `${surface} m²`],
      ["Personnes du foyer fiscal", nbPers],
      ["Revenu fiscal de référence", eur(Number(rfr))],
      ...(mpr ? ([["MaPrimeRénov' (5 ans)", mpr === "oui" ? "Oui" : "Non"]] as [string, string][]) : []),
    ];
    const [bg, fg] = BADGE[res.profil ?? ""] ?? ["", ""];
    return (
      <div className="card" role="status">
        <small className="kicker">Votre résultat</small>
        <h2>{res.titre}</h2>
        <div className={"res" + (res.eligible ? " ok" : "")}><strong>{res.message}</strong><small>{res.detail}</small></div>
        <div className="recap">
          <div className="recap-t">Récapitulatif de votre demande</div>
          {rows.map(([k, v]) => (<div className="row" key={k}><span>{k}</span><b>{v}</b></div>))}
          {res.profil && (
            <div className="row last"><span>Votre profil</span><b className="badge" style={{ background: bg, color: fg }}>Profil {res.profil}</b></div>
          )}
        </div>

        <p className="strong" style={{ margin: "18px 0 10px" }}>Un conseiller prendra contact avec vous à l'heure de votre choix afin de discuter de la faisabilité de votre projet.</p>
        <div className="grid">
          <label>Date *
            <input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>Heure *
            <select value={heure} onChange={(e) => setHeure(e.target.value)}>
              <option value="">Sélectionner…</option>{HEURES.map((h) => <option key={h} value={h}>{heureLabel(h)}</option>)}
            </select>
          </label>
        </div>

        <label className="chk"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>{CONSENT}</span></label>
        {msg && <p className="err" role="alert">{msg}</p>}
        <button className="btn" disabled={busy} onClick={finalize}>{busy ? "Envoi…" : "Envoyer"}</button>
        <button type="button" className="linkbtn" onClick={() => { setMsg(""); setStep(1); }}>Modifier mes réponses</button>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={showRecap} noValidate>
      <div className="prog"><i style={{ width: "50%" }} /></div>
      <h2>Vérifiez votre éligibilité</h2>
      <p className="mut">Quelques questions pour savoir si vous pouvez bénéficier de l'offre pompe à chaleur. Un conseiller vous rappelle ensuite.</p>
      <p className="strong">✓ {GRATUIT}</p>

      <h3 className="sub">Vos coordonnées</h3>
      <div className="grid">
        {FIELDS.map(([k, label, ac, type]) => (
          <label key={k} className={k === "adresse" ? "full" : ""}>{label}{k === "email" ? "" : " *"}
            <input name={k} type={type} autoComplete={ac} required={k !== "email"} value={f[k] ?? ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={!!errs[k]} />
            {errs[k] && <span className="err">Valeur invalide</span>}
          </label>
        ))}
      </div>

      <h3 className="sub">Votre logement et votre foyer</h3>
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

      <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden value={hp} onChange={(e) => setHp(e.target.value)} name="website" />
      {msg && <p className="err" role="alert">{msg}</p>}
      <button className="btn" disabled={busy}>{busy ? "Calcul…" : "Voir mon résultat"}</button>
    </form>
  );
}
