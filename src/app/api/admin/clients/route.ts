import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { vendors } from "@/db/schema";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { message: "Admin access required." } }, { status: 403 });
    }

    const body = await req.json();
    const { name, code, contactName, contactEmail, contactPhone, notes, status } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: { message: "Client name is required." } }, { status: 400 });
    }
    if (!code?.trim()) {
      return NextResponse.json({ success: false, error: { message: "Client code is required." } }, { status: 400 });
    }
    if (!contactEmail?.trim()) {
      return NextResponse.json({ success: false, error: { message: "Contact email is required." } }, { status: 400 });
    }

    const id = randomUUID();
    await db.insert(vendors).values({
      id,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      contactName: contactName?.trim() || null,
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone?.trim() || null,
      notes: notes?.trim() || null,
      status: status || "ACTIVE",
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    const msg = err.message?.includes("unique")
      ? "A client with that code already exists."
      : err.message;
    return NextResponse.json({ success: false, error: { message: msg } }, { status: 400 });
  }
}
