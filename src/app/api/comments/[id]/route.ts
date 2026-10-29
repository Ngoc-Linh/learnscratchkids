import { db } from "@/lib/db";
import { handler, json, requireUser, ApiError } from "@/lib/api";

// Xóa bình luận: chủ bình luận hoặc quản trị viên
export const DELETE = handler(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const comment = await db.comment.findUnique({ where: { id }, select: { userId: true } });
  if (!comment) throw new ApiError("Không tìm thấy bình luận", 404);
  if (comment.userId !== user.id && user.role !== "ADMIN") throw new ApiError("Bạn không có quyền xóa", 403);
  await db.comment.delete({ where: { id } });
  return json({ ok: true });
});
