import { z } from "zod";
import { db } from "@/lib/db";
import { ApiError, handler, json, readBody, requireAdmin } from "@/lib/api";
import { isValidPhone, normalizePhone } from "@/lib/phone";

const schema = z.object({
  childName: z.string().trim().min(1, "Vui lòng nhập tên học viên").max(60),
  parentName: z.string().trim().min(2, "Vui lòng nhập tên phụ huynh").max(60),
  phone: z.string().trim().transform(normalizePhone).refine(isValidPhone, "Số điện thoại không hợp lệ"),
  age: z.coerce.number().int().min(5).max(16),
  track: z.enum(["SCRATCH", "PYTHON", "INFORMATICS"]),
  classId: z.string().uuid().nullable().optional(),
});

export const POST = handler(async (req) => {
  await requireAdmin();
  const body = await readBody(req, schema);

  if (body.classId) {
    const courseClass = await db.courseClass.findUnique({ where: { id: body.classId }, select: { track: true } });
    if (!courseClass) throw new ApiError("Không tìm thấy lớp học", 404);
    if (courseClass.track !== body.track) throw new ApiError("Lớp học không thuộc khóa học đã chọn", 422);
  }

  const student = await db.student.create({
    data: {
      ...body,
      classId: body.classId ?? null,
    },
  });
  return json({ student }, 201);
});
