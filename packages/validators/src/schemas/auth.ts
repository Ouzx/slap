import { z } from "zod";

const EmailSchema = z.string().trim().email().transform((value) => value.toLowerCase());
const PasswordSchema = z.string().min(8).max(128);

export const LoginSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  remember: z.boolean().optional().default(false),
});

export const RegisterSchema = z
  .object({
    email: EmailSchema,
    name: z.string().trim().min(2).max(80),
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
    acceptTerms: z.literal(true),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const MagicLinkSchema = z.object({
  email: EmailSchema,
  redirectTo: z.string().trim().url().optional(),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().trim().min(16),
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });
