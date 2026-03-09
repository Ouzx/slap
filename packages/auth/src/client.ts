import {
  createAuthClient as createBetterAuthClient,
  type BetterAuthClientOptions,
} from "better-auth/client";

export function createAuthClient(options?: BetterAuthClientOptions) {
  return createBetterAuthClient(options);
}
