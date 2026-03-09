import { renderToStaticMarkup } from "react-dom/server";
import { vi } from "vitest";

vi.mock("resend", () => {
  class Resend {
    public emails = {
      send: vi.fn(async (payload) => ({ id: "email_123", ...payload })),
    };

    constructor(_apiKey: string) {}
  }

  return { Resend };
});

import {
  AdminAlertEmail,
  PaymentConfirmationEmail,
  WelcomeEmail,
  createResendTransport,
} from "./index";

describe("email", () => {
  test("renders the welcome template", () => {
    const html = renderToStaticMarkup(
      <WelcomeEmail appName="Slap" loginUrl="https://slap.dev/login" userName="Avery" />,
    );

    expect(html).toContain("Welcome to Slap");
    expect(html).toContain("Avery");
    expect(html).toContain("https://slap.dev/login");
  });

  test("renders payment and admin templates", () => {
    const paymentHtml = renderToStaticMarkup(
      <PaymentConfirmationEmail
        amount="$12.00"
        invoiceNumber="INV-101"
        receiptUrl="https://slap.dev/receipt/INV-101"
      />,
    );
    const alertHtml = renderToStaticMarkup(
      <AdminAlertEmail
        action="Refund requested"
        details="Order 42 needs review."
        severity="high"
      />,
    );

    expect(paymentHtml).toContain("INV-101");
    expect(alertHtml).toContain("Refund requested");
  });

  test("sends rendered email content through resend", async () => {
    const transport = createResendTransport({ apiKey: "test_resend_key" });

    const result = await transport.send({
      from: "ops@slap.dev",
      subject: "Welcome",
      template: (
        <WelcomeEmail
          appName="Slap"
          loginUrl="https://slap.dev/login"
          userName="Avery"
        />
      ),
      to: "avery@example.com",
    });

    expect(result.id).toBe("email_123");
    expect(result.subject).toBe("Welcome");
    expect(result.html).toContain("Welcome to Slap");
  });
});
