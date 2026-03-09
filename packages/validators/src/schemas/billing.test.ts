import {
  CheckoutSchema,
  SubscriptionSchema,
  WebhookPayloadSchema,
} from "./billing";

describe("billing schemas", () => {
  test("accepts checkout payloads with metadata", () => {
    const parsed = CheckoutSchema.parse({
      priceId: "price_monthly",
      successUrl: "https://slap.dev/success",
      cancelUrl: "https://slap.dev/cancel",
      metadata: {
        plan: "pro",
      },
    });

    expect(parsed.quantity).toBe(1);
    expect(parsed.metadata?.plan).toBe("pro");
  });

  test("rejects invalid subscription periods", () => {
    const result = SubscriptionSchema.safeParse({
      id: "sub_123",
      customerId: "cus_123",
      status: "active",
      plan: "monthly",
      currentPeriodStart: "2026-04-01T00:00:00.000Z",
      currentPeriodEnd: "2026-03-01T00:00:00.000Z",
      cancelAtPeriodEnd: false,
    });

    expect(result.success).toBe(false);
  });

  test("accepts webhook events with object payloads", () => {
    const parsed = WebhookPayloadSchema.parse({
      id: "evt_123",
      type: "checkout.completed",
      created: 1_746_388_800,
      data: {
        object: {
          orderId: "ord_123",
        },
      },
    });

    expect(parsed.data.object.orderId).toBe("ord_123");
  });
});
