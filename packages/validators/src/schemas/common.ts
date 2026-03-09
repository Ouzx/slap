import { z } from "zod";

export const SlapIdSchema = z
  .string()
  .trim()
  .regex(/^[a-z][a-z0-9]{11,31}$/i, "Expected a SLAP id");

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const CursorPaginationSchema = z.object({
  cursor: z.string().trim().min(1).nullable().optional().default(null),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const DateRangeSchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  })
  .refine((value) => value.from <= value.to, {
    message: "`from` must be earlier than or equal to `to`",
    path: ["to"],
  });
