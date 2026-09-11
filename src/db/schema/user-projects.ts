import { mysqlTable, varchar, timestamp, uniqueIndex, index } from "drizzle-orm/mysql-core";
import { users } from "./users";
import { projects } from "./projects";

export const userProjects = mysqlTable(
  "user_projects",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
    projectId: varchar("project_id", { length: 36 }).notNull().references(() => projects.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("user_project_uniq_idx").on(table.userId, table.projectId),
    index("up_user_id_idx").on(table.userId),
    index("up_project_id_idx").on(table.projectId),
  ]
);

export type UserProject = typeof userProjects.$inferSelect;
export type NewUserProject = typeof userProjects.$inferInsert;
