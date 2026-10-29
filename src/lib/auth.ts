import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";

const COOKIE = "sk_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 ngày

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Thiếu biến môi trường AUTH_SECRET");
    }
    return new TextEncoder().encode("dev-only-insecure-secret");
  }
  return new TextEncoder().encode(secret);
}

export async function setSession(userId: string): Promise<void> {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export type SessionUser = {
  id: string;
  phone: string | null;
  name: string;
  role: "USER" | "ADMIN";
  stars: number;
};

// Trả về người dùng hiện tại (đọc mới từ DB để số sao luôn chính xác) hoặc null
export async function getUser(): Promise<SessionUser | null> {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub) return null;
    const user = await db.user.findUnique<SessionUser & { isActive: boolean }>({
      where: { id: payload.sub },
      select: { id: true, phone: true, name: true, role: true, stars: true, isActive: true },
    });
    if (!user?.isActive) return null;
    return user;
  } catch {
    return null;
  }
}
