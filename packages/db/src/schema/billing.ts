import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { users } from "./users";

export const billingCustomers = sqliteTable(
  "billing_customers",
  {
    id: text("id").primaryKey(),
    amountCents: integer("amount_cents").notNull().default(0),
    currency: text("currency").notNull().default("USD"),
    customerId: text("customer_id").notNull(),
    periodEndAt: integer("period_end_at", { mode: "timestamp_ms" }),
    periodStartAt: integer("period_start_at", { mode: "timestamp_ms" }),
    plan: text("plan").notNull().default("free"),
    provider: text("provider").notNull().default("stripe"),
    status: text("status").notNull().default("inactive"),
    subscriptionId: text("subscription_id"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    customerIdx: uniqueIndex("billing_customers_customer_id_idx").on(table.customerId),
    subscriptionIdx: uniqueIndex("billing_customers_subscription_id_idx").on(table.subscriptionId),
  }),
);

export type BillingCustomer = typeof billingCustomers.$inferSelect;
export type NewBillingCustomer = typeof billingCustomers.$inferInsert;
