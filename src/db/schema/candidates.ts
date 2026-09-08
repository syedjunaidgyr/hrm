import { mysqlTable, varchar, text, decimal, timestamp, index } from "drizzle-orm/mysql-core";
import { users } from "./users";

export const candidates = mysqlTable(
  "candidates",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phone: varchar("phone", { length: 50 }).notNull(),
    totalExperience: decimal("total_experience", { precision: 4, scale: 1 }).notNull().default("0.0"),
    relevantExperience: decimal("relevant_experience", { precision: 4, scale: 1 }).notNull().default("0.0"),
    currentCompany: varchar("current_company", { length: 255 }),
    currentDesignation: varchar("current_designation", { length: 255 }),
    currentLocation: varchar("current_location", { length: 255 }),
    preferredLocation: varchar("preferred_location", { length: 255 }),
    skills: text("skills").notNull(),
    noticePeriod: varchar("notice_period", { length: 100 }),
    currentSalary: decimal("current_salary", { precision: 12, scale: 2 }),
    expectedSalary: decimal("expected_salary", { precision: 12, scale: 2 }),
    source: varchar("source", { length: 100 }),
    recruiter: varchar("recruiter", { length: 255 }),
    notes: text("notes"),
    createdBy: varchar("created_by", { length: 36 }).notNull().references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("candidate_email_idx").on(table.email),
    index("candidate_phone_idx").on(table.phone),
  ]
);

export type Candidate = typeof candidates.$inferSelect;
export type NewCandidate = typeof candidates.$inferInsert;
