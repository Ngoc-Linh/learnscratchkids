import { db } from "@/lib/db";
import { handler, json, requireUser, ApiError } from "@/lib/api";

// Bật/tắt thả tim
export const POST = handler(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await ctx.params;

  const project = await db.project.findUnique({ where: { id }, select: { id: true } });
  if (!project) throw new ApiError("Không tìm thấy dự án", 404);

  const key = { userId_projectId: { userId: user.id, projectId: id } };
  const existing = await db.heart.findUnique({ where: key });
  if (existing) {
    await db.heart.delete({ where: key });
  } else {
    await db.heart.create({ data: { userId: user.id, projectId: id } });
  }
  const hearts = await db.heart.count({ where: { projectId: id } });
  return json({ hearted: !existing, hearts });
});
