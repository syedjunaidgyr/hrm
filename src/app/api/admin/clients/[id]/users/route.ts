import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { users, userProjects, vendors, projects } from "@/db/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
    }
    const { id: clientId } = await params;

    const client = await db.query.vendors.findFirst({ where: eq(vendors.id, clientId) });
    if (!client) {
      return NextResponse.json({ success: false, error: { message: "Client not found." } }, { status: 404 });
    }

    const clientUsers = await db.query.users.findMany({
      where: and(eq(users.vendorId, clientId), eq(users.role, "VENDOR")),
      columns: {
        id: true,
        name: true,
        email: true,
        status: true,
        accessAllProjects: true,
        createdAt: true,
      },
      with: {
        userProjects: {
          columns: { projectId: true },
          with: { project: { columns: { id: true, name: true } } },
        },
      },
    });

    const clientProjects = await db.query.projects.findMany({
      where: eq(projects.clientId, clientId),
      columns: { id: true, name: true, status: true },
      orderBy: (t, { asc }) => [asc(t.name)],
    });

    return NextResponse.json({
      success: true,
      users: clientUsers.map((u) => ({
        ...u,
        projects: u.userProjects.map((up) => up.project),
      })),
      projects: clientProjects,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
    }
    const { id: clientId } = await params;
    const body = await req.json();
    const { name, email, password, status, accessAllProjects, projectIds } = body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { success: false, error: { message: "Name, email, and password are required." } },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: { message: "Password must be at least 8 characters." } },
        { status: 400 }
      );
    }

    const client = await db.query.vendors.findFirst({ where: eq(vendors.id, clientId) });
    if (!client) {
      return NextResponse.json({ success: false, error: { message: "Client not found." } }, { status: 404 });
    }

    const userId = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    const allProjects = !!accessAllProjects;

    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        vendorId: clientId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role: "VENDOR",
        status: status || "ACTIVE",
        accessAllProjects: allProjects,
      });

      if (!allProjects && Array.isArray(projectIds) && projectIds.length > 0) {
        // Validate projects belong to this client
        const validProjects = await tx.query.projects.findMany({
          where: eq(projects.clientId, clientId),
          columns: { id: true },
        });
        const validIds = new Set(validProjects.map((p) => p.id));
        for (const pid of projectIds) {
          if (!validIds.has(pid)) continue;
          await tx.insert(userProjects).values({
            id: randomUUID(),
            userId,
            projectId: pid,
          });
        }
      }
    });

    return NextResponse.json({ success: true, id: userId });
  } catch (err: any) {
    const msg = err.message?.includes("unique")
      ? "A user with that email already exists."
      : err.message;
    return NextResponse.json({ success: false, error: { message: msg } }, { status: 400 });
  }
}
