import { z } from "zod";

export const CONSENT_VERSION = "v1";
const FR_PHONE = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.\-]*\d{2}){4}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const normalizePhone = (p: string) => {
  const d = p.replace(/[^\d+]/g, "").replace(/^00/, "+").replace(/^\+33/, "0");
  return "+33" + d.replace(/^0/, "");
};

export const INTERETS = ["pompe_a_chaleur", "solaire", "defiscalisation"] as const;

// Formulaire unique : coordonnées + réponses + consentement.
export const leadSchema = z
  .object({
    motif: z.enum(["defiscalisation", "energies"]),
    interet: z.enum(INTERETS),
    prenom: z.string().trim().min(1).max(80),
    nom: z.string().trim().min(1).max(80),
    adresse: z.string().trim().min(3).max(200),
    code_postal: z.string().trim().regex(/^\d{5}$/),
    ville: z.string().trim().min(1).max(100),
    email: z.string().trim().toLowerCase().max(200).optional().default(""),
    telephone: z.string().trim().regex(FR_PHONE),
    consent: z.boolean(),
    preview: z.boolean().optional(), // aperçu du résultat : rien n'est enregistré
    rappel_jour: z.enum(["semaine", "samedi", "peu_importe"]).optional(),
    rappel_creneau: z.enum(["matin", "midi", "apres_midi", "soir"]).optional(),
    answers: z.record(z.string(), z.union([z.string(), z.number()])),
    website: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    const pac = d.interet === "pompe_a_chaleur";
    if (!d.preview && (!d.rappel_jour || !d.rappel_creneau)) ctx.addIssue({ code: "custom", path: ["rappel_jour"], message: "Créneau requis" });
    if (!d.preview && d.consent !== true) ctx.addIssue({ code: "custom", path: ["consent"], message: "Consentement requis" });
    // E-mail obligatoire sauf pour le questionnaire pompe à chaleur, où il est facultatif.
    if ((!pac || d.email) && !EMAIL.test(d.email)) ctx.addIssue({ code: "custom", path: ["email"], message: "E-mail invalide" });
  });

const yn = z.enum(["oui", "non"]);
export const answersSchemas = {
  pompe_a_chaleur: z.object({
    proprietaire: yn,
    surface_habitable: z.coerce.number().min(9).max(2000),
    personnes_foyer_fiscal: z.coerce.number().int().min(1).max(20),
    revenu_fiscal_reference: z.coerce.number().min(0).max(10_000_000),
    maprimerenov_5_ans: yn.optional(),
  }),
  solaire: z.object({
    logement: z.enum(["Maison", "Appartement"]),
    statut: z.enum(["Propriétaire", "Locataire"]),
    facture_annuelle: z.coerce.number().min(0).max(100000),
  }),
  defiscalisation: z.object({
    foyer: z.enum(["Célibataire", "En couple"]),
    revenu_imposable: z.coerce.number().min(0).max(10_000_000),
  }),
} as const;
