import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import type { SlapDb } from "@slap/db";

export interface CreateAuthOptions
  extends Omit<BetterAuthOptions, "baseURL" | "database" | "secret" | "trustedOrigins"> {
  baseURL: string;
  db: SlapDb;
  secret: string;
  trustedOrigins?: string[];
}

export function createAuth(options: CreateAuthOptions) {
  return betterAuth({
    ...options,
    database: drizzleAdapter(options.db, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
      ...(options.emailAndPassword ?? {}),
    },
  });
}
