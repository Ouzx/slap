import {
  browserTracingIntegration,
  init as sentryInit,
  type BrowserOptions,
} from "@sentry/browser";

export interface InitSentryOptions extends Omit<BrowserOptions, "integrations"> {
  enableBrowserTracing?: boolean;
  integrations?: NonNullable<BrowserOptions["integrations"]>;
}

export function initSentry(options: InitSentryOptions) {
  const integrations = [...(options.integrations ?? [])];

  if (options.enableBrowserTracing !== false) {
    integrations.unshift(browserTracingIntegration());
  }

  return sentryInit({
    ...options,
    integrations,
  });
}
