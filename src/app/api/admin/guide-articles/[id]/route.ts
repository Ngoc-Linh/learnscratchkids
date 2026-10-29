import { z } from "zod";
import { ApiError, handler, json, readBody, requireAdmin } from "@/lib/api";
import { db } from "@/lib/db";

const imageUrlSchema = z.string().trim().max(500).refine(
  (value) => !value || (value.startsWith("/") && !value.startsWith("//")) || /^https?:\/\//i.test(value),
  "Đường dẫn hình ảnh không hợp lệ",
);

const articleSchema = z.object({
  category: z.enum(["PRACTICE", "EXAM"]).optional(),
  title: z.string().trim().min(3, "Tiêu đề tối thiểu 3 ký tự").max(120).optional(),
  summary: z.string().trim().min(10, "Mô tả ngắn tối thiểu 10 ký tự").max(300).optional(),
  prompt: z.string().trim().min(10, "Vui lòng nhập nội dung đề bài").max(5000).optional(),
  imageUrl: imageUrlSchema.optional(),
  imageAlt: z.string().trim().max(200).optional(),
  blockCode: z.string().trim().max(10000).optional(),
  algorithm: z.array(z.string().trim().min(1).max(500)).min(1).max(20).optional(),
  explanation: z.string().trim().min(10, "Vui lòng nhập phần giải thích").max(10000).optional(),
  published: z.boolean().optional(),
}).refine((body) => Object.values(body).some((value) => value !== undefined), "Không có thông tin cần cập nhật");

function createSlug(title: string): string {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "bai-giai";
}

export const PATCH = handler(async (req, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const body = await readBody(req, articleSchema);
  const existing = await db.guideArticle.findUnique({ where: { id } });
  if (!existing) throw new ApiError("Không tìm thấy bài hướng dẫn", 404);

  const slug = body.title ? createSlug(body.title) : undefined;
  if (slug) {
    const duplicate = await db.guideArticle.findUnique({ where: { slug } });
    if (duplicate && duplicate.id !== id) {
      throw new ApiError("Đã có bài viết dùng tiêu đề này; hãy đổi tiêu đề để tạo đường dẫn riêng", 409);
    }
  }
  const article = await db.guideArticle.update({
    where: { id },
    data: { ...body, ...(slug ? { slug } : {}) },
  });
  return json({ article });
});

export const DELETE = handler(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const existing = await db.guideArticle.findUnique({ where: { id } });
  if (!existing) throw new ApiError("Không tìm thấy bài hướng dẫn", 404);
  await db.guideArticle.delete({ where: { id } });
  return json({ ok: true });
});
