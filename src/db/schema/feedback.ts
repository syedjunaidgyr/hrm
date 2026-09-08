import { mysqlTable, varchar, text, int, timestamp, index } from "drizzle-orm/mysql-core";
import { candidateSubmissions } from "./submissions";
import { users } from "./users";

export const feedback = mysqlTable(
  "feedback",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    submissionId: varchar("submission_id", { length: 36 }).notNull().references(() => candidateSubmissions.id),
    overallRating: int("overall_rating").notNull(), // 1 to 5
    technicalRating: int("technical_rating").notNull(), // 1 to 5
    communicationRating: int("communication_rating").notNull(), // 1 to 5
    experienceFit: int("experience_fit").notNull(), // 1 to 5
    strengths: text("strengths"),
    concerns: text("concerns"),
    comments: text("comments"),
    recommendation: varchar("recommendation", { length: 50 }).notNull(), // PROCEED_TO_INTERVIEW, REJECT, KEEP_ON_HOLD, PROCEED_TO_NEXT_ROUND
    submittedBy: varchar("submitted_by", { length: 36 }).notNull().references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("fb_submission_id_idx").on(table.submissionId),
  ]
);

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
