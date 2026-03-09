import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { users } from "./users";

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  ipAddress: text("ip_address"),
  metadataJson: text("metadata_json"),
  targetId: text("target_id"),
  targetType: text("target_type"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
