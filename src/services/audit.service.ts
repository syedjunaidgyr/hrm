import { db } from "@/db";
import { auditLogs, NewAuditLog } from "@/db/schema";
import { randomUUID } from "crypto";

export interface LogAuditParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function createAuditLog(params: LogAuditParams, tx?: any) {
  const executor = tx || db;

  const sanitize = (obj: any) => {
    if (!obj || typeof obj !== "object") return obj;
    const clone = { ...obj };
    delete clone.password;
    delete clone.passwordHash;
    delete clone.secret;
    delete clone.token;
    return clone;
  };

  const newLog: NewAuditLog = {
    id: randomUUID(),
    userId: params.userId || null,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId || null,
    oldValue: params.oldValue ? JSON.stringify(sanitize(params.oldValue)) : null,
    newValue: params.newValue ? JSON.stringify(sanitize(params.newValue)) : null,
    ipAddress: params.ipAddress || "127.0.0.1",
    userAgent: params.userAgent || "System",
  };

  await executor.insert(auditLogs).values(newLog);
}

export async function getAuditLogs(options?: {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  userId?: string;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 25;
  const offset = (page - 1) * limit;

  const logs = await db.query.auditLogs.findMany({
    limit,
    offset,
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return { logs, page, limit };
}
