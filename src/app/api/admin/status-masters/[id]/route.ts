import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { updateStatusMaster, deleteStatusMaster, StatusResult } from "@/services/status.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json();
    await updateStatusMaster(id, {
      code: body.code,
      description: body.description,
      result: body.result as StatusResult | undefined,
      clientId: body.clientId,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
      allowedNext: body.allowedNext,
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    const status = err.message === "STATUS_NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ success: false, error: { message: err.message } }, { status });
  }
}

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
    await deleteStatusMaster(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    const status = err.message === "SYSTEM_STATUS_CANNOT_DELETE" ? 403 : 400;
    return NextResponse.json({ success: false, error: { message: err.message } }, { status });
  }
}
