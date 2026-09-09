import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    await requireAdmin();
    const list = await db.query.projects.findMany({
      orderBy: [desc(projects.createdAt)],
      with: {
        client: {
          columns: { id: true, name: true, code: true },
        },
      },
    });
    return NextResponse.json({ success: true, projects: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 403 });
  }
}
