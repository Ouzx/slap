export interface AnalyticsRewriteOptions {
  ingestionHost?: string;
  ingestionPath?: string;
  staticHost?: string;
  staticPath?: string;
}

export function createNextAnalyticsRewrites(options: AnalyticsRewriteOptions = {}) {
  const ingestionPath = normalizePath(options.ingestionPath ?? "/ingest");
  const staticPath = normalizePath(options.staticPath ?? "/ingest/static");

  return [
    {
      destination: `${options.ingestionHost ?? "https://us.i.posthog.com"}/:path*`,
      source: `${ingestionPath}/:path*`,
    },
    {
      destination: `${options.staticHost ?? "https://us-assets.i.posthog.com/static"}/:path*`,
      source: `${staticPath}/:path*`,
    },
  ];
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}
