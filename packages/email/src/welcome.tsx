import { EmailLayout, EmailText } from "./components/layout";

export interface WelcomeEmailProps {
  appName: string;
  loginUrl: string;
  userName: string;
}

export function WelcomeEmail({ appName, loginUrl, userName }: WelcomeEmailProps) {
  return (
    <EmailLayout
      ctaHref={loginUrl}
      ctaLabel="Open your workspace"
      preview={`Welcome to ${appName}`}
      title={`Welcome to ${appName}`}
    >
      <EmailText>Hi {userName},</EmailText>
      <EmailText>
        Your account is ready. Use the button below to sign in and finish your setup.
      </EmailText>
    </EmailLayout>
  );
}
