import { mysqlTable, varchar, text, timestamp, index } from "drizzle-orm/mysql-core";
import { candidateSubmissions } from "./submissions";
import { users } from "./users";

export const comments = mysqlTable(
  "comments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    submissionId: varchar("submission_id", { length: 36 }).notNull().references(() => candidateSubmissions.id),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
    comment: text("comment").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("cmt_submission_id_idx").on(table.submissionId),
    index("cmt_user_id_idx").on(table.userId),
  ]
);

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
