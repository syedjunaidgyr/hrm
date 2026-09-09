import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: clientId } = await params;
    const list = await db.query.projects.findMany({
      where: eq(projects.clientId, clientId),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });
    return NextResponse.json({ success: true, projects: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 403 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: clientId } = await params;
    const body = await req.json();
    const { name, contactName, contactEmail, status } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: { message: "Project name is required." } }, { status: 400 });
    }

    const projectId = randomUUID();
    await db.insert(projects).values({
      id: projectId,
      clientId,
      name,
      contactName: contactName || null,
      contactEmail: contactEmail || null,
      status: status || "ACTIVE",
    });

    return NextResponse.json({ success: true, projectId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 400 });
  }
}
