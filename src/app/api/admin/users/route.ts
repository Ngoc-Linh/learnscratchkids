import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { ApiError, handler, json, readBody, requireAdmin } from "@/lib/api";
import { isValidPhone, normalizePhone } from "@/lib/phone";

const schema = z.object({
  name: z.string().trim().min(2, "Tên tối thiểu 2 ký tự").max(60, "Tên tối đa 60 ký tự"),
  phone: z.string().trim().transform(normalizePhone).refine(isValidPhone, "Số điện thoại không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(100, "Mật khẩu tối đa 100 ký tự"),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});

export const POST = handler(async (req) => {
  await requireAdmin();
  const body = await readBody(req, schema);
  const existing = await db.user.findUnique({ where: { phone: body.phone } });
  if (existing) throw new ApiError("Số điện thoại này đã được tài khoản khác sử dụng", 409);

  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = await db.user.create({
    data: { name: body.name, phone: body.phone, passwordHash, role: body.role },
    select: { id: true, name: true, phone: true, role: true, isActive: true, stars: true, createdAt: true },
  });
  return json({ user }, 201);
});
