import { z } from "zod";
import { db } from "@/lib/db";
import { ApiError, handler, json, readBody, requireAdmin } from "@/lib/api";
import { isValidPhone, normalizePhone } from "@/lib/phone";

const schema = z.object({
  childName: z.string().trim().min(1).max(60).optional(),
  parentName: z.string().trim().min(2).max(60).optional(),
  phone: z.string().trim().transform(normalizePhone).refine(isValidPhone).optional(),
  age: z.coerce.number().int().min(5).max(16).optional(),
  track: z.enum(["SCRATCH", "PYTHON", "INFORMATICS"]).optional(),
  classId: z.string().uuid().nullable().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "LEFT"]).optional(),
}).refine((body) => Object.values(body).some((value) => value !== undefined), "Vui lòng cung cấp thông tin cần cập nhật");

export const PATCH = handler(async (req, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const body = await readBody(req, schema);
  const current = await db.student.findUnique({ where: { id }, select: { track: true } });
  if (!current) throw new ApiError("Không tìm thấy học viên", 404);

  const track = body.track ?? current.track;
  if (body.classId) {
    const courseClass = await db.courseClass.findUnique({ where: { id: body.classId }, select: { track: true } });
    if (!courseClass) throw new ApiError("Không tìm thấy lớp học", 404);
    if (courseClass.track !== track) throw new ApiError("Lớp học không thuộc khóa học đã chọn", 422);
  }

  const student = await db.student.update({ where: { id }, data: body });
  return json({ student });
});
