import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { notifyClientOfSubmissions } from "@/services/submission.service";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
    }

    const body = await req.json();
    const submissionIds: string[] = body.submissionIds || [];
    if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: "Select at least one CV to notify." } },
        { status: 400 }
      );
    }

    const result = await notifyClientOfSubmissions(submissionIds, session.id);
    return NextResponse.json({ success: true, results: result.results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 400 });
  }
}
