import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { updateJob } from "@/services/job.service";

export async function PATCH(
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

    const { id: jobId } = await params;
    const body = await request.json();

    // Admins can edit any job — no vendorId scoping
    await updateJob(jobId, body, session.id, null);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to update Job Description." } },
      { status: 400 }
    );
  }
}
