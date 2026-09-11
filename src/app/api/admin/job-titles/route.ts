import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { jobTitles } from "@/db/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
    }
    const list = await db.query.jobTitles.findMany({
      orderBy: (t, { asc }) => [asc(t.name)],
    });
    return NextResponse.json({ success: true, jobTitles: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
    }
    const body = await req.json();
    const { name, status } = body;
    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: { message: "Name is required." } }, { status: 400 });
    }
    const id = randomUUID();
    await db.insert(jobTitles).values({ id, name: name.trim(), status: status || "ACTIVE" });
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    const msg = err.message?.includes("unique") ? "A job title with that name already exists." : err.message;
    return NextResponse.json({ success: false, error: { message: msg } }, { status: 400 });
  }
}
