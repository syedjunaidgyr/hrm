import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { addCandidateFeedback } from "@/services/feedback.service";

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

    const feedbackId = await addCandidateFeedback(
      { ...body, submissionId },
      session.id,
      session.role,
      session.vendorId
    );

    return NextResponse.json({ success: true, feedbackId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message || "Feedback submission failed." } }, { status: 400 });
  }
}
