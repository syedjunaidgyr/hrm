import { relations } from "drizzle-orm";
import { vendors } from "./vendors";
import { users } from "./users";
import { jobDescriptions } from "./jobs";
import { candidates } from "./candidates";
import { files } from "./files";
import { candidateSubmissions } from "./submissions";
import { feedback } from "./feedback";
import { statusHistory } from "./status-history";
import { comments } from "./comments";
import { notifications } from "./notifications";
import { auditLogs } from "./audit-logs";
import { projects } from "./projects";
import { disciplines } from "./disciplines";
import { statusMasters } from "./status-masters";
import { jobTitles } from "./job-titles";
import { userProjects } from "./user-projects";

export * from "./vendors";
export * from "./users";
export * from "./jobs";
export * from "./candidates";
export * from "./files";
export * from "./submissions";
export * from "./feedback";
export * from "./status-history";
export * from "./comments";
export * from "./notifications";
export * from "./audit-logs";
export * from "./projects";
export * from "./disciplines";
export * from "./status-masters";
export * from "./job-titles";
export * from "./user-projects";

// Drizzle Relations
export const vendorsRelations = relations(vendors, ({ many }) => ({
  users: many(users),
  jobDescriptions: many(jobDescriptions),
  submissions: many(candidateSubmissions),
  projects: many(projects),
  statusMasters: many(statusMasters),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(vendors, {
    fields: [projects.clientId],
    references: [vendors.id],
  }),
  jobDescriptions: many(jobDescriptions),
  userProjects: many(userProjects),
}));

export const disciplinesRelations = relations(disciplines, ({ many }) => ({
  jobDescriptions: many(jobDescriptions),
}));

export const statusMastersRelations = relations(statusMasters, ({ one }) => ({
  client: one(vendors, {
    fields: [statusMasters.clientId],
    references: [vendors.id],
  }),
}));

export const userProjectsRelations = relations(userProjects, ({ one }) => ({
  user: one(users, {
    fields: [userProjects.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [userProjects.projectId],
    references: [projects.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [users.vendorId],
    references: [vendors.id],
  }),
  jobDescriptions: many(jobDescriptions),
  candidatesCreated: many(candidates),
  submissionsCreated: many(candidateSubmissions),
  feedbackSubmitted: many(feedback),
  statusChanges: many(statusHistory),
  commentsCreated: many(comments),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
  userProjects: many(userProjects),
}));

export const jobDescriptionsRelations = relations(jobDescriptions, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [jobDescriptions.vendorId],
    references: [vendors.id],
  }),
  project: one(projects, {
    fields: [jobDescriptions.projectId],
    references: [projects.id],
  }),
  discipline: one(disciplines, {
    fields: [jobDescriptions.disciplineId],
    references: [disciplines.id],
  }),
  createdByUser: one(users, {
    fields: [jobDescriptions.createdBy],
    references: [users.id],
  }),
  submissions: many(candidateSubmissions),
}));

export const candidatesRelations = relations(candidates, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [candidates.createdBy],
    references: [users.id],
  }),
  submissions: many(candidateSubmissions),
  files: many(files),
}));

export const filesRelations = relations(files, ({ one }) => ({
  candidate: one(candidates, {
    fields: [files.candidateId],
    references: [candidates.id],
  }),
  submission: one(candidateSubmissions, {
    fields: [files.submissionId],
    references: [candidateSubmissions.id],
  }),
  uploader: one(users, {
    fields: [files.uploadedBy],
    references: [users.id],
  }),
}));

export const candidateSubmissionsRelations = relations(candidateSubmissions, ({ one, many }) => ({
  job: one(jobDescriptions, {
    fields: [candidateSubmissions.jobId],
    references: [jobDescriptions.id],
  }),
  candidate: one(candidates, {
    fields: [candidateSubmissions.candidateId],
    references: [candidates.id],
  }),
  vendor: one(vendors, {
    fields: [candidateSubmissions.vendorId],
    references: [vendors.id],
  }),
  resumeFile: one(files, {
    fields: [candidateSubmissions.resumeFileId],
    references: [files.id],
  }),
  submitter: one(users, {
    fields: [candidateSubmissions.submittedBy],
    references: [users.id],
  }),
  feedbackList: many(feedback),
  statusHistoryList: many(statusHistory),
  commentsList: many(comments),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  submission: one(candidateSubmissions, {
    fields: [feedback.submissionId],
    references: [candidateSubmissions.id],
  }),
  author: one(users, {
    fields: [feedback.submittedBy],
    references: [users.id],
  }),
}));

export const statusHistoryRelations = relations(statusHistory, ({ one }) => ({
  submission: one(candidateSubmissions, {
    fields: [statusHistory.submissionId],
    references: [candidateSubmissions.id],
  }),
  user: one(users, {
    fields: [statusHistory.changedBy],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  submission: one(candidateSubmissions, {
    fields: [comments.submissionId],
    references: [candidateSubmissions.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
