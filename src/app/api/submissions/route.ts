import { z } from "zod";
import { db } from "@/lib/db";
import { handler, json, readBody, ApiError } from "@/lib/api";
import { getUser } from "@/lib/auth";
import {
  getLesson,
  PYTHON_COURSE_SLUG,
  PYTHON_ENROLLMENT_COURSE_SLUG,
  PYTHON_LESSON_NO,
  STARS_PER_LESSON,
} from "@/lib/courses";

export const dynamic = "force-dynamic";

const schema = z
  .object({
    courseSlug: z.string().min(1),
    lessonNo: z.coerce.number().int().min(1).max(100),
    link: z.string().trim().max(400).optional(),
    pythonCode: z.string().max(20000, "Mã Python tối đa 20.000 ký tự").optional(),
    authorName: z.string().trim().max(60, "Tên hiển thị tối đa 60 ký tự").optional(),
    note: z.string().trim().max(300, "Ghi chú tối đa 300 ký tự").optional(),
  })
  .superRefine((body, ctx) => {
    if (body.courseSlug === PYTHON_COURSE_SLUG) {
      if (body.lessonNo !== PYTHON_LESSON_NO) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["lessonNo"], message: "Bài Python không hợp lệ" });
      }
      if (!body.pythonCode?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pythonCode"], message: "Vui lòng nhập mã Python" });
      }
      if (body.link) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["link"], message: "Bài Python không nhận link" });
      }
      return;
    }

    if (body.pythonCode !== undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pythonCode"], message: "Mã Python chỉ dùng cho bài thực hành Python" });
    }
    if (!body.link) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["link"], message: "Vui lòng dán link bài làm" });
      return;
    }
    try {
      if (new URL(body.link).protocol !== "https:") throw new Error();
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["link"],
        message: "Vui lòng dán link dự án Scratch hoặc link file .sb3 (bắt đầu bằng https://)",
      });
    }
  });

// Bài Scratch và Python dùng chung lịch sử nộp bài; mỗi bài lần đầu được cộng sao.
export const POST = handler(async (req) => {
  const user = await getUser();
  const body = await readBody(req, schema);
  const isPythonSubmission = body.courseSlug === PYTHON_COURSE_SLUG;
  if (!user && !isPythonSubmission) {
    throw new ApiError("Bạn cần đăng nhập để nộp bài cho khóa học", 401);
  }
  if (!isPythonSubmission && !getLesson(body.courseSlug, body.lessonNo)) {
    throw new ApiError("Bài học không tồn tại", 404);
  }
  if (user) {
    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: user.id,
        courseSlug: isPythonSubmission ? PYTHON_ENROLLMENT_COURSE_SLUG : body.courseSlug,
        status: "ENROLLED",
      },
      select: { id: true },
    });
    if (!enrollment) {
      throw new ApiError("Bạn cần hoàn tất đăng ký khóa học trước khi nộp bài", 403);
    }
  }

  const displayName = user?.name ?? (body.authorName?.trim() || "Khách");
  if (!user) {
    await db.submission.create({
      data: {
        courseSlug: body.courseSlug,
        lessonNo: body.lessonNo,
        authorName: displayName,
        link: null,
        pythonCode: body.pythonCode,
        note: body.note || null,
      },
    });
    return json({ ok: true, created: true, authorName: displayName, starsEarned: 0 }, 201);
  }

  const key = { userId_courseSlug_lessonNo: { userId: user.id, courseSlug: body.courseSlug, lessonNo: body.lessonNo } };

  const result = await db.$transaction(async (tx) => {
    const existing = await tx.submission.findUnique({ where: key });
    if (existing) {
      await tx.submission.update({
        where: key,
        data: {
          link: body.link ?? null,
          pythonCode: body.pythonCode ?? null,
          note: body.note || null,
          reviewedAt: null,
        },
      });
      return { first: false };
    }
    await tx.submission.create({
      data: {
        userId: user.id,
        courseSlug: body.courseSlug,
        lessonNo: body.lessonNo,
        link: body.link ?? null,
        pythonCode: body.pythonCode ?? null,
        note: body.note || null,
      },
    });
    await tx.user.update({ where: { id: user.id }, data: { stars: { increment: STARS_PER_LESSON } } });
    return { first: true };
  });

  return json(
    { ok: true, created: result.first, authorName: displayName, starsEarned: result.first ? STARS_PER_LESSON : 0 },
    result.first ? 201 : 200,
  );
});
