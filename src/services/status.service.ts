import { db } from "@/db";
import { statusMasters, NewStatusMaster } from "@/db/schema";
import { and, asc, eq, isNull, or } from "drizzle-orm";
import { randomUUID } from "crypto";

export type EntityType = "JD" | "CANDIDATE";
export type StatusResult = "PENDING" | "WIP" | "CLOSED";

export async function getStatuses(
  entityType: EntityType,
  opts?: { clientId?: string | null; activeOnly?: boolean }
) {
  const activeOnly = opts?.activeOnly !== false;
  const conditions = [eq(statusMasters.entityType, entityType)];

  if (activeOnly) {
    conditions.push(eq(statusMasters.isActive, true));
  }

  // Global (clientId null) + optional client-specific
  if (opts?.clientId) {
    conditions.push(
      or(isNull(statusMasters.clientId), eq(statusMasters.clientId, opts.clientId))!
    );
  } else {
    conditions.push(isNull(statusMasters.clientId));
  }

  const rows = await db.query.statusMasters.findMany({
    where: and(...conditions),
    orderBy: [asc(statusMasters.sortOrder), asc(statusMasters.description)],
  });

  // Prefer client-specific over global when both exist for same code
  if (opts?.clientId) {
    const byCode = new Map<string, (typeof rows)[0]>();
    for (const row of rows) {
      const existing = byCode.get(row.code);
      if (!existing || (row.clientId && !existing.clientId)) {
        byCode.set(row.code, row);
      }
    }
    return Array.from(byCode.values()).sort(
      (a, b) => a.sortOrder - b.sortOrder || a.description.localeCompare(b.description)
    );
  }

  return rows;
}

export async function getStatusByCode(
  entityType: EntityType,
  code: string,
  clientId?: string | null
) {
  const statuses = await getStatuses(entityType, { clientId, activeOnly: true });
  return statuses.find((s) => s.code === code) || null;
}

export async function getAllowedTransitions(
  entityType: EntityType,
  currentCode: string,
  clientId?: string | null
): Promise<string[]> {
  const status = await getStatusByCode(entityType, currentCode, clientId);
  if (!status?.allowedNext) return [];
  try {
    const parsed = JSON.parse(status.allowedNext);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getAllStatusMasters(entityType?: EntityType) {
  const conditions = entityType ? [eq(statusMasters.entityType, entityType)] : [];
  return db.query.statusMasters.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: [
      asc(statusMasters.entityType),
      asc(statusMasters.sortOrder),
      asc(statusMasters.description),
    ],
    with: { client: { columns: { id: true, name: true, code: true } } },
  });
}

export interface CreateStatusMasterInput {
  entityType: EntityType;
  code: string;
  description: string;
  result: StatusResult;
  clientId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  allowedNext?: string[] | null;
}

export async function createStatusMaster(input: CreateStatusMasterInput) {
  const id = randomUUID();
  const code = input.code.trim().toUpperCase().replace(/\s+/g, "_");
  const row: NewStatusMaster = {
    id,
    entityType: input.entityType,
    code,
    description: input.description.trim(),
    result: input.result,
    clientId: input.clientId || null,
    sortOrder: input.sortOrder ?? 0,
    isActive: input.isActive !== false,
    isSystem: false,
    allowedNext: input.allowedNext ? JSON.stringify(input.allowedNext) : null,
  };
  await db.insert(statusMasters).values(row);
  return id;
}

export async function updateStatusMaster(
  id: string,
  input: Partial<CreateStatusMasterInput> & { isActive?: boolean }
) {
  const existing = await db.query.statusMasters.findFirst({
    where: eq(statusMasters.id, id),
  });
  if (!existing) throw new Error("STATUS_NOT_FOUND");

  const updates: Partial<NewStatusMaster> = {};
  if (input.description !== undefined) updates.description = input.description.trim();
  if (input.result !== undefined) updates.result = input.result;
  if (input.sortOrder !== undefined) updates.sortOrder = input.sortOrder;
  if (input.isActive !== undefined) updates.isActive = input.isActive;
  if (input.allowedNext !== undefined) {
    updates.allowedNext = input.allowedNext ? JSON.stringify(input.allowedNext) : null;
  }
  if (input.code !== undefined && !existing.isSystem) {
    updates.code = input.code.trim().toUpperCase().replace(/\s+/g, "_");
  }
  if (input.clientId !== undefined && !existing.isSystem) {
    updates.clientId = input.clientId || null;
  }

  await db.update(statusMasters).set(updates).where(eq(statusMasters.id, id));
}

export async function deleteStatusMaster(id: string) {
  const existing = await db.query.statusMasters.findFirst({
    where: eq(statusMasters.id, id),
  });
  if (!existing) throw new Error("STATUS_NOT_FOUND");
  if (existing.isSystem) throw new Error("SYSTEM_STATUS_CANNOT_DELETE");
  await db.delete(statusMasters).where(eq(statusMasters.id, id));
}

/** Build a map code -> description for badges/labels */
export async function getStatusLabelMap(entityType: EntityType, clientId?: string | null) {
  const statuses = await getStatuses(entityType, { clientId, activeOnly: false });
  const map = new Map<string, { description: string; result: string }>();
  for (const s of statuses) {
    map.set(s.code, { description: s.description, result: s.result });
  }
  return map;
}
