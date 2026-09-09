import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; projectId: string }> }
) {
  try {
    await requireAdmin();
    const { id: clientId, projectId } = await params;
    const body = await req.json();
    const { name, contactName, contactEmail, status } = body;

    const existing = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.clientId, clientId)),
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: { message: "Project not found." } }, { status: 404 });
    }

    const updateData: Record<string, string | null | undefined> = {};
    if (name !== undefined) updateData.name = name;
    if (contactName !== undefined) updateData.contactName = contactName;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (status !== undefined) updateData.status = status;

    await db.update(projects).set(updateData).where(eq(projects.id, projectId));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; projectId: string }> }
) {
  try {
    await requireAdmin();
    const { id: clientId, projectId } = await params;

    const existing = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.clientId, clientId)),
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: { message: "Project not found." } }, { status: 404 });
    }

    await db.delete(projects).where(eq(projects.id, projectId));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 400 });
  }
}
