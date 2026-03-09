import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";

import { auditLog } from "./schema/audit";
import { billingCustomers } from "./schema/billing";
import { contentEntries } from "./schema/content";
import { users } from "./schema/users";

export const dbSchema = {
  auditLog,
  billingCustomers,
  contentEntries,
  users,
};

export type SlapDbSchema = typeof dbSchema;
export type SlapDb = LibSQLDatabase<SlapDbSchema>;

export interface CreateDbOptions {
  authToken?: string;
  client?: Client;
  url: string;
}

export interface CreatedDb {
  client: Client;
  db: SlapDb;
  schema: SlapDbSchema;
}

export function createDb(options: CreateDbOptions): CreatedDb {
  const client =
    options.client ??
    createClient({
      authToken: options.authToken,
      url: options.url,
    });

  const db = drizzle(client, {
    schema: dbSchema,
  });

  return {
    client,
    db,
    schema: dbSchema,
  };
}
