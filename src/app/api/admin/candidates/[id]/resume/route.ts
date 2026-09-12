import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { deleteCandidateResume, replaceCandidateResume } from "@/services/candidate.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
    }

    const { id } = await params;
    const formData = await request.formData();
    const resumeFile = formData.get("resume") as File | null;
    if (!resumeFile) {
      return NextResponse.json({ success: false, error: { message: "Resume file is required." } }, { status: 400 });
    }

    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    const result = await replaceCandidateResume(
      id,
      {
        resumeBuffer: buffer,
        resumeFileName: resumeFile.name,
        mimeType: resumeFile.type || "application/pdf",
      },
      session.id
    );

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    const message = err.message || "Failed to replace resume.";
    const status = message.includes("CANDIDATE_NOT_FOUND") ? 404 : 400;
    return NextResponse.json({ success: false, error: { message } }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
    }

    const { id } = await params;
    const fileId = request.nextUrl.searchParams.get("fileId") || undefined;
    await deleteCandidateResume(id, session.id, fileId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    const message = err.message || "Failed to delete resume.";
    const status = message.includes("CANDIDATE_NOT_FOUND") || message.includes("RESUME_NOT_FOUND") ? 404 : 400;
    return NextResponse.json({ success: false, error: { message } }, { status });
  }
}
