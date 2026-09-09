import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { updateCandidateSubmissionStatus } from "@/services/submission.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { message: "Admin access required." } },
        { status: 403 }
      );
    }

    const { id: submissionId } = await params;
    const body = await request.json();
    const { status, reason } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: { message: "status is required." } },
        { status: 400 }
      );
    }

    const result = await updateCandidateSubmissionStatus(
      submissionId,
      status,
      reason || "",
      session.id,
      "ADMIN"
    );

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Status update failed." } },
      { status: 400 }
    );
  }
}
