import { EmailLayout, EmailText } from "./components/layout";

export interface PaymentConfirmationEmailProps {
  amount: string;
  invoiceNumber: string;
  receiptUrl: string;
}

export function PaymentConfirmationEmail({
  amount,
  invoiceNumber,
  receiptUrl,
}: PaymentConfirmationEmailProps) {
  return (
    <EmailLayout
      ctaHref={receiptUrl}
      ctaLabel="View receipt"
      preview={`Payment received for ${invoiceNumber}`}
      title="Payment confirmed"
    >
      <EmailText>We received your payment of {amount}.</EmailText>
      <EmailText>Invoice reference: {invoiceNumber}</EmailText>
    </EmailLayout>
  );
}
