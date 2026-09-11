import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getAllStatusMasters,
  createStatusMaster,
  EntityType,
  StatusResult,
} from "@/services/status.service";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
    }
    const entityType = req.nextUrl.searchParams.get("entityType") as EntityType | null;
    const list = await getAllStatusMasters(entityType || undefined);
    return NextResponse.json({ success: true, statuses: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
    }
    const body = await req.json();
    const { entityType, code, description, result, clientId, sortOrder, isActive, allowedNext } = body;
    if (!entityType || !["JD", "CANDIDATE"].includes(entityType)) {
      return NextResponse.json({ success: false, error: { message: "entityType must be JD or CANDIDATE." } }, { status: 400 });
    }
    if (!code?.trim() || !description?.trim()) {
      return NextResponse.json({ success: false, error: { message: "Code and description are required." } }, { status: 400 });
    }
    if (!result || !["PENDING", "WIP", "CLOSED"].includes(result)) {
      return NextResponse.json({ success: false, error: { message: "result must be PENDING, WIP, or CLOSED." } }, { status: 400 });
    }
    const id = await createStatusMaster({
      entityType: entityType as EntityType,
      code,
      description,
      result: result as StatusResult,
      clientId: clientId || null,
      sortOrder: sortOrder ?? 0,
      isActive: isActive !== false,
      allowedNext: allowedNext || null,
    });
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    const msg = err.message?.includes("unique")
      ? "A status with that code already exists for this entity/client."
      : err.message;
    return NextResponse.json({ success: false, error: { message: msg } }, { status: 400 });
  }
}
