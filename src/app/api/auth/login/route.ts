import { NextResponse } from "next/server";
import { loginUser } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, next } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Email and password are required." } },
        { status: 400 }
      );
    }

    const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown";

    const user = await loginUser(email, password, clientIp, userAgent);

    const defaultRedirect = user.role === "ADMIN" ? "/admin/dashboard" : "/vendor/jobs";
    const safeNext =
      typeof next === "string" &&
      next.startsWith("/") &&
      !next.startsWith("//") &&
      ((user.role === "ADMIN" && next.startsWith("/admin")) ||
        (user.role === "VENDOR" && next.startsWith("/vendor")))
        ? next
        : defaultRedirect;

    return NextResponse.json({
      success: true,
      data: {
        user,
        redirectTo: safeNext,
      },
    });
  } catch (err: any) {
    const message = err.message || "An unexpected error occurred during login.";
    const status = message.includes("INVALID_CREDENTIALS") ? 401 : 400;
    return NextResponse.json(
      { success: false, error: { code: "AUTHENTICATION_FAILED", message } },
      { status }
    );
  }
}
