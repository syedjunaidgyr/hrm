import { mysqlTable, varchar, timestamp, index, uniqueIndex } from "drizzle-orm/mysql-core";
import { jobDescriptions } from "./jobs";
import { candidates } from "./candidates";
import { vendors } from "./vendors";
import { users } from "./users";
import { files } from "./files";

// Candidate status lifecycle:
// NEW (auto on upload) → VIEWED (auto on open/download) → REJECTED_L1 | INTERVIEW_SCHEDULED
// → INTERVIEW_COMPLETED → REJECTED_L2 | PROGRESSED → ONBOARDED → BILLED

export const candidateSubmissions = mysqlTable(
  "candidate_submissions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    jobId: varchar("job_id", { length: 36 }).notNull().references(() => jobDescriptions.id),
    candidateId: varchar("candidate_id", { length: 36 }).notNull().references(() => candidates.id),
    vendorId: varchar("vendor_id", { length: 36 }).notNull().references(() => vendors.id),
    resumeFileId: varchar("resume_file_id", { length: 36 }).notNull().references(() => files.id),
    // NEW | VIEWED | REJECTED_L1 | INTERVIEW_SCHEDULED | INTERVIEW_COMPLETED |
    // INTERVIEW_DATETIME | REJECTED_L2 | PROGRESSED | ONBOARDED | BILLED
    status: varchar("status", { length: 50 }).notNull().default("NEW"),
    interviewDateTime: timestamp("interview_date_time"),
    submittedBy: varchar("submitted_by", { length: 36 }).notNull().references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("candidate_job_uniq_idx").on(table.candidateId, table.jobId),
    index("sub_job_id_idx").on(table.jobId),
    index("sub_vendor_id_idx").on(table.vendorId),
    index("sub_candidate_id_idx").on(table.candidateId),
    index("sub_status_idx").on(table.status),
  ]
);

export type CandidateSubmission = typeof candidateSubmissions.$inferSelect;
export type NewCandidateSubmission = typeof candidateSubmissions.$inferInsert;
