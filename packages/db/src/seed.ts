import { createDb, type SlapDb } from "./client";

export interface SeedDatabaseOptions {
  db: SlapDb;
  logger?: Pick<Console, "info">;
}

export interface SeedDatabaseResult {
  message: string;
  seeded: false;
}

export async function seedDatabase(
  options: SeedDatabaseOptions,
): Promise<SeedDatabaseResult> {
  options.logger?.info("Seed skeleton loaded. Add fixtures before running production seeds.");

  return {
    message: "Seed skeleton loaded. No rows were inserted.",
    seeded: false,
  };
}

async function main(): Promise<void> {
  const env = getEnv();
  const database = createDb({
    authToken: env.DATABASE_AUTH_TOKEN,
    url: env.DATABASE_URL ?? "file:local.db",
  });

  const result = await seedDatabase({
    db: database.db,
    logger: console,
  });

  console.info(result.message);
}

const meta = import.meta as ImportMeta & { main?: boolean };

if (meta.main) {
  void main();
}

function getEnv(): Record<string, string | undefined> {
  return (globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  }).process?.env ?? {};
}
