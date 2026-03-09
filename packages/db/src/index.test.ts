import { getTableName } from "drizzle-orm";

import { auditLog, billingCustomers, contentEntries, createDb, users } from "./index";

describe("db", () => {
  test("defines the core sqlite tables", () => {
    expect(getTableName(users)).toBe("users");
    expect(getTableName(contentEntries)).toBe("content_entries");
    expect(getTableName(billingCustomers)).toBe("billing_customers");
    expect(getTableName(auditLog)).toBe("audit_log");
  });

  test("creates a database client with the schema attached", () => {
    const database = createDb({
      url: "file:local.db",
      authToken: "test-token",
    });

    expect(database.db).toBeDefined();
    expect(database.client).toBeDefined();
    expect(database.schema.users).toBe(users);
  });
});
