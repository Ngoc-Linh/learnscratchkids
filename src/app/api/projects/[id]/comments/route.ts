import { z } from "zod";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { handler, json, readBody, requireUser, ApiError } from "@/lib/api";
import type { CommentView } from "@/lib/types";

export const dynamic = "force-dynamic";

const schema = z.object({
  content: z.string().trim().min(1, "Bình luận không được để trống").max(300, "Bình luận tối đa 300 ký tự"),
});

export const GET = handler(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const me = await getUser();
  const rows = await db.comment.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: { user: { select: { name: true } } },
  });
  const comments: CommentView[] = rows.map((c) => ({
    id: c.id,
    content: c.content,
    userName: c.user.name,
    createdAt: c.createdAt.toISOString(),
    mine: me?.id === c.userId,
  }));
  return json({ comments });
});

export const POST = handler(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const { content } = await readBody(req, schema);

  const project = await db.project.findUnique({ where: { id }, select: { id: true } });
  if (!project) throw new ApiError("Không tìm thấy dự án", 404);

  const c = await db.comment.create({ data: { content, projectId: id, userId: user.id } });
  const comment: CommentView = {
    id: c.id,
    content: c.content,
    userName: user.name,
    createdAt: c.createdAt.toISOString(),
    mine: true,
  };
  return json({ comment }, 201);
});
