import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const resources = sqliteTable("resources", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  level: text("level").notNull(),
  fileType: text("file_type").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  objectKey: text("object_key").notNull(),
  status: text("status").notNull().default("published"),
  createdAt: text("created_at").notNull(),
});
