import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { jobTitles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json();
    const update: Record<string, string> = {};
    if (body.name !== undefined) update.name = body.name.trim();
    if (body.status !== undefined) update.status = body.status;
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, error: { message: "Nothing to update." } }, { status: 400 });
    }
    await db.update(jobTitles).set(update).where(eq(jobTitles.id, id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    const msg = err.message?.includes("unique") ? "A job title with that name already exists." : err.message;
    return NextResponse.json({ success: false, error: { message: msg } }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
    }
    const { id } = await params;
    await db.delete(jobTitles).where(eq(jobTitles.id, id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 400 });
  }
}
