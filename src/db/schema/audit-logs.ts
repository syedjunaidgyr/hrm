import { mysqlTable, varchar, text, timestamp, index } from "drizzle-orm/mysql-core";
import { users } from "./users";

export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).references(() => users.id),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: varchar("entity_id", { length: 100 }),
    oldValue: text("old_value"),
    newValue: text("new_value"),
    ipAddress: varchar("ip_address", { length: 100 }),
    userAgent: varchar("user_agent", { length: 500 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("audit_user_id_idx").on(table.userId),
    index("audit_action_idx").on(table.action),
    index("audit_entity_idx").on(table.entityType, table.entityId),
  ]
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
