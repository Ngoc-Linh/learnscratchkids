import { db } from "@/lib/db";
import { handler, json, requireUser, ApiError } from "@/lib/api";
import { monthKey } from "@/lib/scratch";

// Bình chọn "Game của tháng": mỗi người 1 phiếu/tháng. Bấm lại để bỏ phiếu, bấm dự án khác để đổi phiếu.
export const POST = handler(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const month = monthKey();

  const project = await db.project.findUnique({ where: { id }, select: { id: true, userId: true } });
  if (!project) throw new ApiError("Không tìm thấy dự án", 404);
  if (project.userId === user.id) throw new ApiError("Bạn không thể bình chọn cho dự án của chính mình", 400);

  const key = { userId_month: { userId: user.id, month } };
  const existing = await db.vote.findUnique({ where: key });

  let voted: boolean;
  if (existing && existing.projectId === id) {
    await db.vote.delete({ where: key });
    voted = false;
  } else {
    await db.vote.upsert({
      where: key,
      update: { projectId: id },
      create: { userId: user.id, projectId: id, month },
    });
    voted = true;
  }

  const monthVotes = await db.vote.count({ where: { projectId: id, month } });
  return json({ voted, monthVotes, previousProjectId: existing && existing.projectId !== id ? existing.projectId : null });
});
