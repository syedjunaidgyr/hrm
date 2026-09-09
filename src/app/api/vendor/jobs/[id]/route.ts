import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { updateJob } from "@/services/job.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "VENDOR" || !session.vendorId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized vendor access." } },
        { status: 403 }
      );
    }

    const { id: jobId } = await params;
    const body = await request.json();

    await updateJob(jobId, body, session.id, session.vendorId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to update Job Description." } },
      { status: 400 }
    );
  }
}
