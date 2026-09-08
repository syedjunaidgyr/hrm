import { mysqlTable, varchar, int, timestamp, index } from "drizzle-orm/mysql-core";
import { candidates } from "./candidates";
import { users } from "./users";

export const files = mysqlTable(
  "files",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    candidateId: varchar("candidate_id", { length: 36 }).notNull().references(() => candidates.id),
    submissionId: varchar("submission_id", { length: 36 }),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    storageKey: varchar("storage_key", { length: 500 }).notNull(),
    storageProvider: varchar("storage_provider", { length: 50 }).notNull().default("local"),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    fileSize: int("file_size").notNull(),
    uploadedBy: varchar("uploaded_by", { length: 36 }).notNull().references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("file_candidate_id_idx").on(table.candidateId),
    index("file_submission_id_idx").on(table.submissionId),
  ]
);

export type FileRecord = typeof files.$inferSelect;
export type NewFileRecord = typeof files.$inferInsert;
