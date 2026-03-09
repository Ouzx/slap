import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Resend } from "resend";

export interface SendEmailOptions {
  from: string;
  subject: string;
  template: ReactElement;
  text?: string;
  to: string | string[];
}

export interface EmailTransport {
  send(options: SendEmailOptions): Promise<unknown>;
}

export interface ResendTransportOptions {
  apiKey: string;
}

export function createResendTransport(options: ResendTransportOptions): EmailTransport {
  const resend = new Resend(options.apiKey);

  return {
    async send(email) {
      const html = renderToStaticMarkup(email.template);

      return resend.emails.send({
        from: email.from,
        html,
        subject: email.subject,
        text: email.text,
        to: email.to,
      });
    },
  };
}
