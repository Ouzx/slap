import { EmailLayout, EmailText } from "./components/layout";

export interface MagicLinkEmailProps {
  expiresInMinutes: number;
  loginUrl: string;
}

export function MagicLinkEmail({ expiresInMinutes, loginUrl }: MagicLinkEmailProps) {
  return (
    <EmailLayout
      ctaHref={loginUrl}
      ctaLabel="Sign in securely"
      preview="Your secure magic link"
      title="Use your magic link"
    >
      <EmailText>Use this one-time link to sign in without entering a password.</EmailText>
      <EmailText>This link expires in {expiresInMinutes} minutes.</EmailText>
    </EmailLayout>
  );
}
