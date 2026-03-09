import { EmailLayout, EmailText } from "./components/layout";

export interface AdminAlertEmailProps {
  action: string;
  details: string;
  severity: "high" | "low" | "medium";
}

export function AdminAlertEmail({
  action,
  details,
  severity,
}: AdminAlertEmailProps) {
  return (
    <EmailLayout
      preview={`Admin alert: ${action}`}
      title={`Admin alert: ${action}`}
    >
      <EmailText>Severity: {severity}</EmailText>
      <EmailText>{details}</EmailText>
    </EmailLayout>
  );
}
