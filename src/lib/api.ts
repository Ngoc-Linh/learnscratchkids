import { NextResponse } from "next/server";
import type { z } from "zod";
import { getUser, type SessionUser } from "./auth";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

// Bọc route handler: bắt lỗi và trả JSON thống nhất { error }
export function handler<C = unknown>(fn: (req: Request, ctx: C) => Promise<Response>) {
  return async (req: Request, ctx: C): Promise<Response> => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof ApiError) return NextResponse.json({ error: e.message }, { status: e.status });
      console.error("[api] unexpected error:", e);
      return NextResponse.json({ error: "Có lỗi xảy ra phía máy chủ. Vui lòng thử lại." }, { status: 500 });
    }
  };
}

export async function readBody<T>(req: Request, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ApiError("Dữ liệu gửi lên không hợp lệ", 400);
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ApiError(result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ", 422);
  }
  return result.data;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) throw new ApiError("Bạn cần đăng nhập để thực hiện thao tác này", 401);
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new ApiError("Bạn không có quyền truy cập", 403);
  return user;
}
