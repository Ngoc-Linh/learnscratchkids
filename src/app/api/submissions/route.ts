import { z } from "zod";
import { db } from "@/lib/db";
import { handler, json, readBody, requireUser, ApiError } from "@/lib/api";
import { getLesson, STARS_PER_LESSON } from "@/lib/courses";

export const dynamic = "force-dynamic";

const schema = z.object({
  courseSlug: z.string().min(1),
  lessonNo: z.coerce.number().int().min(1).max(100),
  link: z
    .string()
    .trim()
    .max(400)
    .refine((v) => {
      try {
        return new URL(v).protocol === "https:";
      } catch {
        return false;
      }
    }, "Vui lòng dán link dự án Scratch hoặc link file .sb3 (bắt đầu bằng https://)"),
  note: z.string().trim().max(300, "Ghi chú tối đa 300 ký tự").optional(),
});

// Học viên nộp bài: dán link dự án Scratch hoặc link file .sb3. Lần nộp đầu của mỗi bài được cộng sao.
export const POST = handler(async (req) => {
  const user = await requireUser();
  const body = await readBody(req, schema);
  if (!getLesson(body.courseSlug, body.lessonNo)) throw new ApiError("Bài học không tồn tại", 404);

  const key = { userId_courseSlug_lessonNo: { userId: user.id, courseSlug: body.courseSlug, lessonNo: body.lessonNo } };

  const result = await db.$transaction(async (tx) => {
    const existing = await tx.submission.findUnique({ where: key });
    if (existing) {
      await tx.submission.update({
        where: key,
        data: { link: body.link, note: body.note || null, reviewedAt: null },
      });
      return { first: false };
    }
    await tx.submission.create({
      data: {
        userId: user.id,
        courseSlug: body.courseSlug,
        lessonNo: body.lessonNo,
        link: body.link,
        note: body.note || null,
      },
    });
    await tx.user.update({ where: { id: user.id }, data: { stars: { increment: STARS_PER_LESSON } } });
    return { first: true };
  });

  return json({ ok: true, starsEarned: result.first ? STARS_PER_LESSON : 0 }, result.first ? 201 : 200);
});
