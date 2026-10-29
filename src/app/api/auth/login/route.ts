import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";
import { handler, json, readBody, ApiError } from "@/lib/api";
import { isValidPhone, normalizePhone } from "@/lib/phone";

const schema = z.object({
  phone: z.string().trim().transform(normalizePhone).refine(isValidPhone, "Số điện thoại không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const POST = handler(async (req) => {
  const body = await readBody(req, schema);

  const user = await db.user.findUnique({ where: { phone: body.phone } });
  const valid = user?.isActive ? await bcrypt.compare(body.password, user.passwordHash) : false;
  if (!user || !valid) throw new ApiError("Số điện thoại hoặc mật khẩu không đúng", 401);

  await setSession(user.id);
  return json({ user: { id: user.id, name: user.name, phone: user.phone, role: user.role, stars: user.stars } });
});
