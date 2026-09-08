import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createJob } from "@/services/job.service";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "VENDOR" || !session.vendorId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized vendor access." } }, { status: 403 });
    }

    const body = await request.json();
    const jobId = await createJob(body, session.id, session.vendorId);

    return NextResponse.json({ success: true, jobId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message || "Failed to save Job Description." } }, { status: 400 });
  }
}
