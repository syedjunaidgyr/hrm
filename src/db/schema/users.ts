import { mysqlTable, varchar, timestamp, text, boolean, index } from "drizzle-orm/mysql-core";
import { vendors } from "./vendors";

export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    vendorId: varchar("vendor_id", { length: 36 }).references(() => vendors.id),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: varchar("role", { length: 20 }).notNull().default("VENDOR"), // 'ADMIN' | 'VENDOR'
    status: varchar("status", { length: 20 }).notNull().default("ACTIVE"),
    accessAllProjects: boolean("access_all_projects").notNull().default(false),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("vendor_id_idx").on(table.vendorId),
    index("role_idx").on(table.role),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
