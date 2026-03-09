import { defineConfig } from "drizzle-kit";

const env = getEnv();

export default defineConfig({
  dbCredentials: {
    authToken: env.DATABASE_AUTH_TOKEN,
    url: env.DATABASE_URL ?? "file:local.db",
  },
  dialect: "sqlite",
  out: "./drizzle",
  schema: "./src/schema/*.ts",
});

function getEnv(): Record<string, string | undefined> {
  return (globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  }).process?.env ?? {};
}
