import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getUserNotifications } from "@/services/notification.service";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, notifications: [] }, { status: 401 });
  }

  const items = await getUserNotifications(session.id);
  return NextResponse.json({ success: true, notifications: items });
}
