import { z } from "zod";
import { ApiError, handler, json, readBody, requireAdmin } from "@/lib/api";
import { db } from "@/lib/db";

const imageUrlSchema = z.string().trim().max(500).refine(
  (value) => !value || (value.startsWith("/") && !value.startsWith("//")) || /^https?:\/\//i.test(value),
  "Đường dẫn hình ảnh không hợp lệ",
);

const articleSchema = z.object({
  category: z.enum(["PRACTICE", "EXAM"]),
  title: z.string().trim().min(3, "Tiêu đề tối thiểu 3 ký tự").max(120),
  summary: z.string().trim().min(10, "Mô tả ngắn tối thiểu 10 ký tự").max(300),
  prompt: z.string().trim().min(10, "Vui lòng nhập nội dung đề bài").max(5000),
  imageUrl: imageUrlSchema,
  imageAlt: z.string().trim().max(200),
  blockCode: z.string().trim().max(10000),
  algorithm: z.array(z.string().trim().min(1).max(500)).min(1).max(20),
  explanation: z.string().trim().min(10, "Vui lòng nhập phần giải thích").max(10000),
  published: z.boolean(),
});

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

export const GET = handler(async () => {
  await requireAdmin();
  const articles = await db.guideArticle.findMany({ orderBy: { updatedAt: "desc" } });
  return json({ articles });
});

export const POST = handler(async (req) => {
  await requireAdmin();
  const body = await readBody(req, articleSchema);
  const slug = createSlug(body.title);
  if (await db.guideArticle.findUnique({ where: { slug } })) {
    throw new ApiError("Đã có bài viết dùng tiêu đề này; hãy đổi tiêu đề để tạo đường dẫn riêng", 409);
  }
  const article = await db.guideArticle.create({ data: { ...body, slug } });
  return json({ article }, 201);
});
