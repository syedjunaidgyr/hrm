import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { deleteCandidate } from "@/services/candidate.service";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
    }
    const { id } = await params;
    await deleteCandidate(id, session.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    const message = err.message || "Failed to delete candidate.";
    const status = message.includes("CANDIDATE_NOT_FOUND") ? 404 : 400;
    return NextResponse.json({ success: false, error: { message } }, { status });
  }
}
