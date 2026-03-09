import { z } from "zod";

import {
  LoginSchema,
  MagicLinkSchema,
  RegisterSchema,
  ResetPasswordSchema,
} from "../schemas/auth";
import {
  CheckoutSchema,
  SubscriptionSchema,
  WebhookPayloadSchema,
} from "../schemas/billing";
import {
  CursorPaginationSchema,
  DateRangeSchema,
  PaginationSchema,
  SlapIdSchema,
} from "../schemas/common";
import {
  RichTextDocumentCreateSchema,
  RichTextDocumentSchema,
  RichTextDocumentUpdateSchema,
  RichTextNodeSchema,
} from "../schemas/content";
import {
  AvatarSchema,
  PreferencesSchema,
  ProfileUpdateSchema,
} from "../schemas/user";

export type SlapId = z.infer<typeof SlapIdSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type CursorPagination = z.infer<typeof CursorPaginationSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type MagicLinkInput = z.infer<typeof MagicLinkSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type AvatarInput = z.infer<typeof AvatarSchema>;
export type PreferencesInput = z.infer<typeof PreferencesSchema>;

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;

export type RichTextNode = z.infer<typeof RichTextNodeSchema>;
export type RichTextDocument = z.infer<typeof RichTextDocumentSchema>;
export type RichTextDocumentCreateInput = z.infer<typeof RichTextDocumentCreateSchema>;
export type RichTextDocumentUpdateInput = z.infer<typeof RichTextDocumentUpdateSchema>;
