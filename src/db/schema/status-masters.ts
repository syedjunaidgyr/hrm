import { mysqlTable, varchar, text, int, boolean, timestamp, index, uniqueIndex } from "drizzle-orm/mysql-core";
import { vendors } from "./vendors";

// Status masters for JD and Candidate lifecycle
// entityType: JD | CANDIDATE
// result: PENDING | WIP | CLOSED (used for rollups / Pending counts)
export const statusMasters = mysqlTable(
  "status_masters",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    entityType: varchar("entity_type", { length: 20 }).notNull(), // JD | CANDIDATE
    code: varchar("code", { length: 50 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    result: varchar("result", { length: 20 }).notNull().default("PENDING"), // PENDING | WIP | CLOSED
    clientId: varchar("client_id", { length: 36 }).references(() => vendors.id), // null = global
    sortOrder: int("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    isSystem: boolean("is_system").notNull().default(false), // system rows cannot be deleted
    allowedNext: text("allowed_next"), // JSON array of codes, e.g. '["VIEWED","REJECTED_L1"]'
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("status_entity_code_client_uniq").on(table.entityType, table.code, table.clientId),
    index("status_entity_type_idx").on(table.entityType),
    index("status_client_id_idx").on(table.clientId),
  ]
);

export type StatusMaster = typeof statusMasters.$inferSelect;
export type NewStatusMaster = typeof statusMasters.$inferInsert;
