import { z } from "zod";

export const CONSENT_VERSION = "v1";
const FR_PHONE = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.\-]*\d{2}){4}$/;

export const normalizePhone = (p: string) => {
  const d = p.replace(/[^\d+]/g, "").replace(/^00/, "+").replace(/^\+33/, "0");
  return "+33" + d.replace(/^0/, "");
};

export const leadSchema = z.object({
  motif: z.enum(["defiscalisation", "energies"]),
  prenom: z.string().trim().min(1).max(80),
  nom: z.string().trim().min(1).max(80),
  adresse: z.string().trim().min(3).max(200),
  code_postal: z.string().trim().regex(/^\d{5}$/),
  ville: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(200),
  telephone: z.string().trim().regex(FR_PHONE),
  consent: z.literal(true),
  simulation: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  website: z.string().optional(),
});
