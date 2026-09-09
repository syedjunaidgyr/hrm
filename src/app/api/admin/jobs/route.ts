import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createJob } from "@/services/job.service";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { message: "Admin access required." } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { vendorId, ...rest } = body;

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: { message: "vendorId (client) is required." } },
        { status: 400 }
      );
    }

    const jobId = await createJob(rest, session.id, vendorId);
    return NextResponse.json({ success: true, jobId });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to create Job Description." } },
      { status: 400 }
    );
  }
}
