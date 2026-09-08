import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { updateCandidateSubmissionStatus } from "@/services/submission.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "VENDOR" || !session.vendorId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized vendor access." } }, { status: 403 });
    }

    const { id: submissionId } = await params;
    const body = await request.json();
    const { status, reason } = body;

    const result = await updateCandidateSubmissionStatus(
      submissionId,
      status,
      reason,
      session.id,
      session.role,
      session.vendorId
    );

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message || "Status transition failed." } }, { status: 400 });
  }
}
