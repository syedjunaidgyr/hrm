import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { markAllNotificationsAsRead } from "@/services/notification.service";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  await markAllNotificationsAsRead(session.id);
  return NextResponse.json({ success: true });
}
