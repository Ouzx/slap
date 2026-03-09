import { z } from "zod";

import { SlapIdSchema } from "./common";

type RichTextNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
};

export const RichTextNodeSchema: z.ZodType<RichTextNode> = z.lazy(() =>
  z
    .object({
      type: z.enum([
        "doc",
        "paragraph",
        "text",
        "heading",
        "bulletList",
        "orderedList",
        "listItem",
        "blockquote",
      ]),
      text: z.string().optional(),
      attrs: z.record(z.unknown()).optional(),
      content: z.array(RichTextNodeSchema).optional(),
    })
    .superRefine((node, ctx) => {
      if (node.type === "text" && !node.text) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Text nodes require text content",
          path: ["text"],
        });
      }
    }),
);

export const RichTextDocumentSchema = z.object({
  type: z.literal("doc"),
  content: z.array(RichTextNodeSchema).min(1),
});

export const RichTextDocumentCreateSchema = z.object({
  title: z.string().trim().min(3).max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  summary: z.string().trim().max(300).optional(),
  document: RichTextDocumentSchema,
});

export const RichTextDocumentUpdateSchema = z
  .object({
    id: SlapIdSchema,
    title: z.string().trim().min(3).max(120).optional(),
    summary: z.string().trim().max(300).nullable().optional(),
    published: z.boolean().optional(),
    document: RichTextDocumentSchema.optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.summary !== undefined ||
      value.published !== undefined ||
      value.document !== undefined,
    {
      message: "At least one field must be updated",
    },
  );
