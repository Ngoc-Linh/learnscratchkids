import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";
import { handler, json, readBody, ApiError } from "@/lib/api";
import { isValidPhone, normalizePhone } from "@/lib/phone";

const schema = z.object({
  name: z.string().trim().min(2, "Tên quá ngắn").max(60, "Tên quá dài"),
  phone: z.string().trim().transform(normalizePhone).refine(isValidPhone, "Số điện thoại không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(100, "Mật khẩu quá dài"),
});

export const POST = handler(async (req) => {
  const body = await readBody(req, schema);

  const exists = await db.user.findUnique({ where: { phone: body.phone }, select: { id: true } });
  if (exists) throw new ApiError("Số điện thoại này đã được đăng ký", 409);

  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = await db.user.create({
    data: { name: body.name, phone: body.phone, passwordHash },
    select: { id: true, name: true, phone: true, role: true, stars: true },
  });

  await setSession(user.id);
  return json({ user }, 201);
});
