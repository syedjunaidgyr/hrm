import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";

export const jobTitles = mysqlTable("job_titles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 20 }).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type JobTitle = typeof jobTitles.$inferSelect;
export type NewJobTitle = typeof jobTitles.$inferInsert;
