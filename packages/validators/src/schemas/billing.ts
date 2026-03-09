import { z } from "zod";

export const CheckoutSchema = z.object({
  priceId: z.string().trim().min(3),
  customerId: z.string().trim().min(3).optional(),
  successUrl: z.string().trim().url(),
  cancelUrl: z.string().trim().url(),
  quantity: z.coerce.number().int().min(1).max(100).default(1),
  metadata: z.record(z.string().max(200)).optional(),
});

export const SubscriptionSchema = z
  .object({
    id: z.string().trim().min(3),
    customerId: z.string().trim().min(3),
    status: z.enum(["trialing", "active", "past_due", "canceled", "incomplete"]),
    plan: z.enum(["monthly", "yearly", "enterprise"]),
    currentPeriodStart: z.coerce.date(),
    currentPeriodEnd: z.coerce.date(),
    cancelAtPeriodEnd: z.boolean().default(false),
  })
  .refine((value) => value.currentPeriodStart <= value.currentPeriodEnd, {
    message: "Subscription periods must be chronological",
    path: ["currentPeriodEnd"],
  });

export const WebhookPayloadSchema = z.object({
  id: z.string().trim().min(3),
  type: z.enum([
    "checkout.completed",
    "checkout.expired",
    "subscription.updated",
    "subscription.canceled",
    "invoice.paid",
    "invoice.payment_failed",
  ]),
  created: z.number().int().nonnegative(),
  data: z.object({
    object: z.record(z.any()),
  }),
});
