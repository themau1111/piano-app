import { z } from "zod";

export const ProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(/^[a-z0-9_]{3,20}$/i, "3–20 caracteres: letras, números o _")
    .optional()
    .or(z.literal("")),
  displayName: z.string().trim().max(60).optional().or(z.literal("")),
  bio: z.string().trim().max(280).optional().or(z.literal("")),
  website: z.string().trim().url("URL inválida").optional().or(z.literal("")),
  location: z.string().trim().max(80).optional().or(z.literal("")),
  timezone: z.string().trim().max(60).optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;
