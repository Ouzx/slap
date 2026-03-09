import { vi } from "vitest";

const { posthogInit, sentryInit, browserTracingIntegration, mockPosthogClient } = vi.hoisted(() => {
  const client = { capture: vi.fn(), identify: vi.fn() };
  return {
    posthogInit: vi.fn(() => client),
    sentryInit: vi.fn(),
    browserTracingIntegration: vi.fn(() => ({ name: "browserTracingIntegration" })),
    mockPosthogClient: client,
  };
});

vi.mock("posthog-js", () => ({
  default: {
    init: posthogInit,
  },
}));

vi.mock("@sentry/browser", () => ({
  browserTracingIntegration,
  init: sentryInit,
}));

import {
  createNextAnalyticsRewrites,
  getPostHog,
  initSentry,
  resetPostHog,
} from "./index";

describe("analytics", () => {
  test("initializes posthog only once", () => {
    const clientA = getPostHog({
      apiKey: "ph_test",
      apiHost: "https://metrics.slap.dev",
    });
    const clientB = getPostHog({
      apiKey: "ph_test",
      apiHost: "https://metrics.slap.dev",
    });

    expect(clientA).toBe(clientB);
    expect(posthogInit).toHaveBeenCalledTimes(1);

    resetPostHog();
  });

  test("initializes sentry with browser tracing by default", () => {
    initSentry({
      dsn: "https://public@example.ingest.sentry.io/1",
      environment: "test",
      tracesSampleRate: 0.25,
    });

    expect(browserTracingIntegration).toHaveBeenCalledTimes(1);
    expect(sentryInit).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://public@example.ingest.sentry.io/1",
        environment: "test",
        integrations: [{ name: "browserTracingIntegration" }],
      }),
    );
  });

  test("creates rewrites that proxy analytics around ad blockers", () => {
    expect(
      createNextAnalyticsRewrites({
        ingestionPath: "/ingest",
        staticPath: "/assets/ingest",
      }),
    ).toEqual([
      {
        destination: "https://us.i.posthog.com/:path*",
        source: "/ingest/:path*",
      },
      {
        destination: "https://us-assets.i.posthog.com/static/:path*",
        source: "/assets/ingest/:path*",
      },
    ]);
  });
});
