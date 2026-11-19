import { z } from "zod";
import { db } from "@/lib/db";
import { handler, json, readBody, requireAdmin } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "Tên lớp tối thiểu 2 ký tự").max(80),
  track: z.enum(["SCRATCH", "PYTHON", "INFORMATICS"]),
  weekday: z.coerce.number().int().min(1).max(7),
  startsAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ học không hợp lệ"),
});

export const POST = handler(async (req) => {
  await requireAdmin();
  const body = await readBody(req, schema);
  const courseClass = await db.courseClass.create({ data: body });
  return json({ courseClass }, 201);
});
