import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { logoutUser } from "@/services/auth.service";

export async function POST(request: Request) {
  const session = await getSession();
  const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "Unknown";

  await logoutUser(session?.id, clientIp, userAgent);
  return NextResponse.json({ success: true, redirectTo: "/login" });
}
