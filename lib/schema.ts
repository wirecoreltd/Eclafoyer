import { z } from "zod";

export const CONSENT_VERSION = "v1";
const FR_PHONE = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.\-]*\d{2}){4}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const normalizePhone = (p: string) => {
  const d = p.replace(/[^\d+]/g, "").replace(/^00/, "+").replace(/^\+33/, "0");
  return "+33" + d.replace(/^0/, "");
};

export const leadSchema = z
  .object({
    motif: z.enum(["defiscalisation", "energies"]),
    prenom: z.string().trim().min(1).max(80),
    nom: z.string().trim().min(1).max(80),
    adresse: z.string().trim().min(3).max(200),
    code_postal: z.string().trim().regex(/^\d{5}$/),
    ville: z.string().trim().min(1).max(100),
    email: z.string().trim().toLowerCase().max(200).optional().default(""),
    telephone: z.string().trim().regex(FR_PHONE),
    consent: z.literal(true),
    simulation: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
    website: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    const pac = d.simulation?.interet === "pompe_a_chaleur";
    // E-mail obligatoire sauf pour le questionnaire pompe à chaleur, où il est facultatif.
    if ((!pac || d.email) && !EMAIL.test(d.email)) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "E-mail invalide" });
    }
    if (pac) {
      const s = d.simulation ?? {};
      if (s.proprietaire !== "oui" && s.proprietaire !== "non")
        ctx.addIssue({ code: "custom", path: ["simulation"], message: "Propriétaire : réponse requise" });
      const surface = Number(s.surface_habitable);
      if (!Number.isFinite(surface) || surface < 9 || surface > 2000)
        ctx.addIssue({ code: "custom", path: ["simulation"], message: "Surface habitable invalide" });
    }
  });
