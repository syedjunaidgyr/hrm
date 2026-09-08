import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { createAuditLog } from "./audit.service";
import { createSessionToken, setSessionCookie, clearSessionCookie } from "@/lib/auth/session";

export async function loginUser(email: string, password: string, ipAddress?: string, userAgent?: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
    with: { vendor: true },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS: Email or password is incorrect.");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("ACCOUNT_INACTIVE: Your user account is currently disabled.");
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error("INVALID_CREDENTIALS: Email or password is incorrect.");
  }

  const sessionPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "ADMIN" | "VENDOR",
    vendorId: user.vendorId || null,
  };

  const token = await createSessionToken(sessionPayload);
  try {
    await setSessionCookie(token);
  } catch (err) {
    // Next.js request context safe catch for standalone scripts/tests
  }

  await createAuditLog({
    userId: user.id,
    action: "LOGIN",
    entityType: "User",
    entityId: user.id,
    ipAddress,
    userAgent,
  });

  return sessionPayload;
}

export async function logoutUser(userId?: string, ipAddress?: string, userAgent?: string) {
  if (userId) {
    await createAuditLog({
      userId,
      action: "LOGOUT",
      entityType: "User",
      entityId: userId,
      ipAddress,
      userAgent,
    });
  }
  try {
    await clearSessionCookie();
  } catch (err) {}
}
