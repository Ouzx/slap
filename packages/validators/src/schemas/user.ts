import { z } from "zod";

export const ProfileUpdateSchema = z.object({
  displayName: z.string().trim().min(2).max(80).optional(),
  headline: z.string().trim().min(2).max(120).nullable().optional(),
  bio: z.string().trim().max(280).nullable().optional(),
  website: z
    .string()
    .trim()
    .url()
    .nullable()
    .optional(),
  location: z.string().trim().max(80).nullable().optional(),
});

export const AvatarSchema = z.object({
  url: z
    .string()
    .trim()
    .url()
    .refine((value) => value.startsWith("https://"), {
      message: "Avatar urls must be https",
    }),
  alt: z.string().trim().max(120).optional(),
  blurDataUrl: z
    .string()
    .trim()
    .regex(/^data:image\//, "Expected an image data URL")
    .optional(),
});

export const PreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  locale: z.string().trim().regex(/^[a-z]{2}-[A-Z]{2}$/),
  timezone: z.string().trim().min(1).max(100),
  marketingEmails: z.boolean().optional().default(false),
  productUpdates: z.boolean().optional().default(true),
});
