import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "super-secret-key-recruitment-portal-2026-auth-jwt"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  let session: { role: string; vendorId?: string | null } | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      session = {
        role: payload.role as string,
        vendorId: (payload.vendorId as string) || null,
      };
    } catch {
      session = null;
    }
  }

  // Public routes
  if (pathname === "/login" || pathname === "/") {
    if (session) {
      const target = session.role === "ADMIN" ? "/admin/dashboard" : "/vendor/jobs";
      return NextResponse.redirect(new URL(target, request.url));
    }
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Protected Admin Routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/vendor/jobs", request.url));
    }
  }

  // Protected Vendor Routes
  if (pathname.startsWith("/vendor")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.role !== "VENDOR") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/public).*)"],
};
