import { EmailLayout, EmailText } from "./components/layout";

export interface InvoiceEmailProps {
  amountDue: string;
  dueDate: string;
  invoiceNumber: string;
  invoiceUrl: string;
}

export function InvoiceEmail({
  amountDue,
  dueDate,
  invoiceNumber,
  invoiceUrl,
}: InvoiceEmailProps) {
  return (
    <EmailLayout
      ctaHref={invoiceUrl}
      ctaLabel="View invoice"
      preview={`Invoice ${invoiceNumber} is ready`}
      title="Your invoice is ready"
    >
      <EmailText>Invoice {invoiceNumber} is available for review.</EmailText>
      <EmailText>
        Amount due: {amountDue}. Due date: {dueDate}.
      </EmailText>
    </EmailLayout>
  );
}
