import { EmailLayout, EmailText } from "./components/layout";

export interface PasswordResetEmailProps {
  resetUrl: string;
  userName?: string;
}

export function PasswordResetEmail({
  resetUrl,
  userName = "there",
}: PasswordResetEmailProps) {
  return (
    <EmailLayout
      ctaHref={resetUrl}
      ctaLabel="Reset password"
      preview="Reset your password"
      title="Password reset request"
    >
      <EmailText>Hi {userName},</EmailText>
      <EmailText>
        We received a request to reset your password. If that was you, use the button below.
      </EmailText>
    </EmailLayout>
  );
}
