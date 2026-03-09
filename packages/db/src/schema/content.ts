import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { users } from "./users";

export const contentEntries = sqliteTable(
  "content_entries",
  {
    id: text("id").primaryKey(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bodyJson: text("body_json"),
    coverImageUrl: text("cover_image_url"),
    excerpt: text("excerpt"),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    slug: text("slug").notNull(),
    status: text("status").notNull().default("draft"),
    title: text("title").notNull(),
    type: text("type").notNull().default("article"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    slugIdx: uniqueIndex("content_entries_slug_idx").on(table.slug),
  }),
);

export type ContentEntry = typeof contentEntries.$inferSelect;
export type NewContentEntry = typeof contentEntries.$inferInsert;
