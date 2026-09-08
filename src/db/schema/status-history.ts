import { mysqlTable, varchar, text, timestamp, index } from "drizzle-orm/mysql-core";
import { candidateSubmissions } from "./submissions";
import { users } from "./users";

export const statusHistory = mysqlTable(
  "status_history",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    submissionId: varchar("submission_id", { length: 36 }).notNull().references(() => candidateSubmissions.id),
    fromStatus: varchar("from_status", { length: 50 }).notNull(),
    toStatus: varchar("to_status", { length: 50 }).notNull(),
    reason: text("reason"),
    changedBy: varchar("changed_by", { length: 36 }).notNull().references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("sh_submission_id_idx").on(table.submissionId),
  ]
);

export type StatusHistory = typeof statusHistory.$inferSelect;
export type NewStatusHistory = typeof statusHistory.$inferInsert;
