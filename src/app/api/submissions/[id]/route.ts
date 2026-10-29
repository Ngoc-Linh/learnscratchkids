import { z } from "zod";
import { db } from "@/lib/db";
import { handler, json, readBody, requireAdmin, ApiError } from "@/lib/api";

const schema = z.object({
  feedback: z.string().trim().max(1000, "Nhận xét tối đa 1000 ký tự").optional(),
  bonusStars: z.coerce.number().int().min(0).max(20).default(0),
});

// Giáo viên nhận xét bài nộp và (tùy chọn) thưởng thêm sao
export const PATCH = handler(async (req, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const body = await readBody(req, schema);

  await db.$transaction(async (tx) => {
    const sub = await tx.submission.findUnique({ where: { id } });
    if (!sub) throw new ApiError("Không tìm thấy bài nộp", 404);
    const delta = body.bonusStars - sub.bonusStars;
    await tx.submission.update({
      where: { id },
      data: { feedback: body.feedback || null, bonusStars: body.bonusStars, reviewedAt: new Date() },
    });
    if (delta !== 0) {
      await tx.user.update({ where: { id: sub.userId }, data: { stars: { increment: delta } } });
    }
  });

  return json({ ok: true });
});
