import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { users, userProjects, projects } from "@/db/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
    }
    const { id: clientId, userId } = await params;
    const body = await req.json();

    const existing = await db.query.users.findFirst({
      where: and(eq(users.id, userId), eq(users.vendorId, clientId), eq(users.role, "VENDOR")),
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: { message: "User not found." } }, { status: 404 });
    }

    const updates: Partial<typeof users.$inferInsert> = {};
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.email !== undefined) updates.email = body.email.trim().toLowerCase();
    if (body.status !== undefined) updates.status = body.status;
    if (body.accessAllProjects !== undefined) updates.accessAllProjects = !!body.accessAllProjects;
    if (body.password?.trim()) {
      if (body.password.length < 8) {
        return NextResponse.json(
          { success: false, error: { message: "Password must be at least 8 characters." } },
          { status: 400 }
        );
      }
      updates.passwordHash = await bcrypt.hash(body.password, 10);
    }

    await db.transaction(async (tx) => {
      if (Object.keys(updates).length > 0) {
        await tx.update(users).set(updates).where(eq(users.id, userId));
      }

      if (body.projectIds !== undefined || body.accessAllProjects !== undefined) {
        const allProjects =
          body.accessAllProjects !== undefined
            ? !!body.accessAllProjects
            : existing.accessAllProjects;

        await tx.delete(userProjects).where(eq(userProjects.userId, userId));

        if (!allProjects && Array.isArray(body.projectIds)) {
          const validProjects = await tx.query.projects.findMany({
            where: eq(projects.clientId, clientId),
            columns: { id: true },
          });
          const validIds = new Set(validProjects.map((p) => p.id));
          for (const pid of body.projectIds) {
            if (!validIds.has(pid)) continue;
            await tx.insert(userProjects).values({
              id: randomUUID(),
              userId,
              projectId: pid,
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const msg = err.message?.includes("unique")
      ? "A user with that email already exists."
      : err.message;
    return NextResponse.json({ success: false, error: { message: msg } }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
    }
    const { id: clientId, userId } = await params;

    const existing = await db.query.users.findFirst({
      where: and(eq(users.id, userId), eq(users.vendorId, clientId), eq(users.role, "VENDOR")),
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: { message: "User not found." } }, { status: 404 });
    }

    // Soft-deactivate instead of hard delete (preserves audit/history FKs)
    await db.update(users).set({ status: "INACTIVE" }).where(eq(users.id, userId));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 400 });
  }
}
