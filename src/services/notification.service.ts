import { db } from "@/db";
import { notifications, NewNotification } from "@/db/schema";
import { randomUUID } from "crypto";
import { eq, and, desc } from "drizzle-orm";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  link?: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "ACTION";
}

export async function createNotification(params: CreateNotificationParams, tx?: any) {
  const executor = tx || db;
  const newNotif: NewNotification = {
    id: randomUUID(),
    userId: params.userId,
    title: params.title,
    message: params.message,
    link: params.link || null,
    type: params.type || "INFO",
    isRead: false,
  };
  await executor.insert(notifications).values(newNotif);
}

export async function getUserNotifications(userId: string, limit = 20) {
  return await db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: [desc(notifications.createdAt)],
    limit,
  });
}

export async function markNotificationAsRead(id: string, userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsAsRead(userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}
