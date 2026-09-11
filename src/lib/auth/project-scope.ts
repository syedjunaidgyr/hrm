import { db } from "@/db";
import { users, userProjects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { SessionUser } from "@/lib/auth/session";

export type ClientProjectScope =
  | { all: true; projectIds: string[] }
  | { all: false; projectIds: string[] };

/**
 * Resolve which projects a client (VENDOR) user can see.
 * Admins should not call this for filtering — they see everything.
 */
export async function getClientProjectScope(
  session: SessionUser
): Promise<ClientProjectScope> {
  if (session.role !== "VENDOR" || !session.vendorId) {
    return { all: true, projectIds: [] };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.id),
    columns: { id: true, accessAllProjects: true, vendorId: true },
  });

  if (!user) {
    return { all: false, projectIds: [] };
  }

  if (user.accessAllProjects) {
    return { all: true, projectIds: [] };
  }

  const links = await db.query.userProjects.findMany({
    where: eq(userProjects.userId, session.id),
    columns: { projectId: true },
  });

  return {
    all: false,
    projectIds: links.map((l) => l.projectId),
  };
}

/** True if the user may access a JD with the given projectId (may be null). */
export function scopeAllowsProject(
  scope: ClientProjectScope,
  projectId: string | null | undefined
): boolean {
  if (scope.all) return true;
  if (!projectId) return false; // unscoped JDs hidden from project-limited users
  return scope.projectIds.includes(projectId);
}

/** Get client user IDs who should be notified for a given project. */
export async function getNotifiableClientUsers(
  vendorId: string,
  projectId: string | null | undefined
) {
  const clientUsers = await db.query.users.findMany({
    where: and(eq(users.vendorId, vendorId), eq(users.role, "VENDOR"), eq(users.status, "ACTIVE")),
    columns: {
      id: true,
      email: true,
      name: true,
      accessAllProjects: true,
    },
    with: {
      userProjects: { columns: { projectId: true } },
    },
  });

  return clientUsers.filter((u) => {
    if (u.accessAllProjects) return true;
    if (!projectId) return false;
    return u.userProjects.some((up) => up.projectId === projectId);
  });
}
