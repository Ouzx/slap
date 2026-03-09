import type { PropsWithChildren } from "react";

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface EmailLayoutProps extends PropsWithChildren {
  ctaHref?: string;
  ctaLabel?: string;
  preview: string;
  title: string;
}

export function EmailLayout({
  children,
  ctaHref,
  ctaLabel,
  preview,
  title,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{title}</Heading>
          <Section>{children}</Section>
          {ctaHref && ctaLabel ? (
            <Section style={styles.ctaSection}>
              <Button href={ctaHref} style={styles.button}>
                {ctaLabel}
              </Button>
            </Section>
          ) : null}
          <Hr style={styles.rule} />
          <Text style={styles.footer}>Sent by Slap</Text>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailText({ children }: PropsWithChildren) {
  return <Text style={styles.text}>{children}</Text>;
}

const styles = {
  body: {
    backgroundColor: "#f5efe4",
    fontFamily: "Arial, sans-serif",
    margin: 0,
    padding: "32px 12px",
  },
  button: {
    backgroundColor: "#14532d",
    borderRadius: "12px",
    color: "#f6f5ef",
    fontWeight: "700",
    padding: "12px 18px",
    textDecoration: "none",
  },
  container: {
    backgroundColor: "#fffdf8",
    border: "1px solid #d7c7a7",
    borderRadius: "20px",
    margin: "0 auto",
    maxWidth: "560px",
    padding: "32px",
  },
  ctaSection: {
    marginTop: "24px",
    textAlign: "left" as const,
  },
  footer: {
    color: "#675d50",
    fontSize: "12px",
    marginBottom: 0,
  },
  heading: {
    color: "#1d1a16",
    fontSize: "28px",
    lineHeight: "34px",
    margin: "0 0 16px",
  },
  rule: {
    borderColor: "#e9ddc4",
    margin: "24px 0 16px",
  },
  text: {
    color: "#352f28",
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0 0 12px",
  },
};
