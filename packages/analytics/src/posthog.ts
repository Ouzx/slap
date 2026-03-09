import posthog, { type PostHogConfig } from "posthog-js";

let postHogInstance: ReturnType<typeof posthog.init> | undefined;

export interface GetPostHogOptions {
  apiHost?: string;
  apiKey: string;
  config?: Partial<PostHogConfig>;
  instanceName?: string;
}

export function getPostHog(options: GetPostHogOptions) {
  if (!postHogInstance) {
    postHogInstance = posthog.init(
      options.apiKey,
      {
        api_host: options.apiHost ?? "https://us.i.posthog.com",
        capture_pageview: false,
        persistence: "localStorage+cookie",
        ...options.config,
      },
      options.instanceName,
    );
  }

  return postHogInstance;
}

export function resetPostHog() {
  postHogInstance = undefined;
}
