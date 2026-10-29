import { z } from "zod";
import { db } from "@/lib/db";
import { handler, json, readBody, requireAdmin, ApiError } from "@/lib/api";

const schema = z.object({ status: z.enum(["NEW", "CONTACTED", "ENROLLED", "CANCELLED"]) });

export const PATCH = handler(async (req, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const { status } = await readBody(req, schema);
  const result = await db.enrollment.updateMany({ where: { id }, data: { status } });
  if (result.count === 0) throw new ApiError("Không tìm thấy đăng ký", 404);
  return json({ ok: true });
});
