import { mysqlTable, varchar, text, int, decimal, timestamp, date, index } from "drizzle-orm/mysql-core";
import { vendors } from "./vendors";
import { users } from "./users";

export const jobDescriptions = mysqlTable(
  "job_descriptions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    vendorId: varchar("vendor_id", { length: 36 }).notNull().references(() => vendors.id),
    jobCode: varchar("job_code", { length: 50 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    department: varchar("department", { length: 100 }).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    employmentType: varchar("employment_type", { length: 50 }).notNull().default("FULL_TIME"),
    workMode: varchar("work_mode", { length: 50 }).notNull().default("ON_SITE"),
    minExperience: int("min_experience").notNull().default(0),
    maxExperience: int("max_experience").notNull().default(0),
    numPositions: int("num_positions").notNull().default(1),
    minSalary: decimal("min_salary", { precision: 12, scale: 2 }),
    maxSalary: decimal("max_salary", { precision: 12, scale: 2 }),
    requiredSkills: text("required_skills").notNull(),
    preferredSkills: text("preferred_skills"),
    description: text("description").notNull(),
    responsibilities: text("responsibilities"),
    requirements: text("requirements"),
    education: varchar("education", { length: 255 }),
    noticePeriod: varchar("notice_period", { length: 100 }),
    priority: varchar("priority", { length: 20 }).notNull().default("MEDIUM"), // LOW, MEDIUM, HIGH, URGENT
    targetJoiningDate: date("target_joining_date"),
    additionalNotes: text("additional_notes"),
    status: varchar("status", { length: 20 }).notNull().default("DRAFT"), // DRAFT, SUBMITTED, CLOSED
    createdBy: varchar("created_by", { length: 36 }).notNull().references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("job_vendor_id_idx").on(table.vendorId),
    index("job_status_idx").on(table.status),
    index("job_priority_idx").on(table.priority),
  ]
);

export type JobDescription = typeof jobDescriptions.$inferSelect;
export type NewJobDescription = typeof jobDescriptions.$inferInsert;
