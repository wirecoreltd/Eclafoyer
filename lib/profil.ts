// SERVEUR UNIQUEMENT : ne jamais importer ce fichier depuis un composant "use client".
// Les plafonds et montants ci-dessous ne doivent pas être envoyés au navigateur.
// Plafonds de ressources MaPrimeRénov' 2026 (revenu fiscal de référence). À mettre à jour chaque année.
export type Profil = "bleu" | "jaune" | "violet" | "rose";
export type Zone = "idf" | "hors_idf";

const PAC_COUT = 14500;
const PAC_RESTE_A_CHARGE_BLEU = 1; // reste à charge estimé (symbolique) pour le profil bleu
const eur = (n: number) => n.toLocaleString("fr-FR").replace(/\u202f/g, " ") + " €";

// Seuils [bleu, jaune, violet] pour 1 à 5 personnes + montant par personne supplémentaire.
const PLAFONDS: Record<Zone, { base: number[][]; extra: number[] }> = {
  hors_idf: {
    base: [[17363, 22259, 31185], [25393, 32553, 45842], [30540, 39148, 55196], [35676, 45735, 64550], [40835, 52348, 73907]],
    extra: [5151, 6598, 9357],
  },
  idf: {
    base: [[24031, 29253, 40851], [35270, 42933, 60051], [42357, 51564, 71846], [49455, 60208, 84562], [56580, 68877, 96817]],
    extra: [7116, 8663, 12257],
  },
};

const IDF_DEPARTEMENTS = ["75", "77", "78", "91", "92", "93", "94", "95"];
export const zoneFromCodePostal = (cp: string): Zone => (IDF_DEPARTEMENTS.includes(cp.slice(0, 2)) ? "idf" : "hors_idf");

export function getProfil(rfr: number, personnes: number, zone: Zone): Profil {
  const t = PLAFONDS[zone];
  const n = Math.max(1, Math.floor(personnes));
  const seuils = n <= 5 ? t.base[n - 1] : t.base[4].map((v, i) => v + (n - 5) * t.extra[i]);
  if (rfr <= seuils[0]) return "bleu";
  if (rfr <= seuils[1]) return "jaune";
  if (rfr <= seuils[2]) return "violet";
  return "rose";
}

const LIBELLES: Record<Profil, string> = { bleu: "très modeste", jaune: "modeste", violet: "intermédiaire", rose: "aisé" };

export type Resultat = { eligible: boolean; titre: string; message: string; detail: string; profil?: Profil; profilLibelle?: string };

export function evaluerPac(p: { rfr: number; personnes: number; codePostal: string; proprietaire: "oui" | "non" }): { profil: Profil; zone: Zone; resultat: Resultat } {
  const zone = zoneFromCodePostal(p.codePostal);
  const profil = getProfil(p.rfr, p.personnes, zone);
  const eligible = profil === "bleu" && p.proprietaire === "oui";
  const base = { eligible, profil, profilLibelle: LIBELLES[profil] };
  const resultat: Resultat = eligible
    ? { ...base, titre: "Bonne nouvelle, vous semblez éligible",
        message: `Pompe à chaleur d'environ ${eur(PAC_COUT)} : reste à charge estimé de ${eur(PAC_RESTE_A_CHARGE_BLEU)}`,
        detail: "Estimation indicative, sous réserve d'éligibilité et de validation de votre dossier par un conseiller (logement, travaux, aides en vigueur)." }
    : { ...base, titre: "Merci, votre demande est enregistrée",
        message: "Après analyse de votre dossier, un reste à charge est à prévoir",
        detail: "Un conseiller vous rappelle pour en parler avec vous et étudier les aides qui s'appliquent à votre situation." };
  return { profil, zone, resultat };
}

export const RESULTAT_GENERIQUE: Resultat = {
  eligible: false,
  titre: "Demande envoyée",
  message: "Un conseiller vous rappelle très vite",
  detail: "Il étudiera votre situation avec vous, sans engagement.",
};
