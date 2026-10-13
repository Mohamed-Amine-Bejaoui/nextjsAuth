import { z } from "zod";
 
export const registerSchema = z.object({
  name: z.string().trim()
    .min(2, "Nom : 2 caractères minimum"),
  email: z.string().trim().toLowerCase()
    .email("Email invalide"),
  password: z.string()
    .min(8, "Mot de passe : 8 caractères minimum"),
});
 
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase()
    .email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const studentCreateSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  level: z.string().trim().max(100).optional(),
  pedagogicalInfo: z.string().trim().max(2000).optional(),
  userId: z.number().int().positive().nullable().optional(),
});

export const studentUpdateSchema = studentCreateSchema.partial().omit({
  userId: true,
});
