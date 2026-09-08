import { mysqlTable, varchar, text, boolean, timestamp, index } from "drizzle-orm/mysql-core";
import { users } from "./users";

export const notifications = mysqlTable(
  "notifications",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    link: varchar("link", { length: 500 }),
    isRead: boolean("is_read").notNull().default(false),
    type: varchar("type", { length: 50 }).notNull().default("INFO"), // INFO, SUCCESS, WARNING, ACTION
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("notif_user_id_idx").on(table.userId),
    index("notif_read_idx").on(table.isRead),
  ]
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
