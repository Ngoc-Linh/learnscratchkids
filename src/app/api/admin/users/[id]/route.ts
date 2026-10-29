import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { handler, json, readBody, requireAdmin, ApiError } from "@/lib/api";
import { isValidPhone, normalizePhone } from "@/lib/phone";

const schema = z
  .object({
    name: z.string().trim().min(2, "Tên tối thiểu 2 ký tự").max(60, "Tên tối đa 60 ký tự").optional(),
    phone: z.string().trim().transform(normalizePhone).refine(isValidPhone, "Số điện thoại không hợp lệ").optional(),
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(100, "Mật khẩu tối đa 100 ký tự").optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), "Không có thông tin cần cập nhật");

export const PATCH = handler(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const body = await readBody(req, schema);

  const existing = await db.user.findUnique({ where: { id } });
  if (!existing) throw new ApiError("Không tìm thấy tài khoản", 404);

  if (body.phone) {
    const duplicate = await db.user.findUnique({ where: { phone: body.phone } });
    if (duplicate && duplicate.id !== id) {
      throw new ApiError("Số điện thoại này đã được tài khoản khác sử dụng", 409);
    }
  }

  const removesActiveAdmin =
    existing.role === "ADMIN" &&
    existing.isActive &&
    (body.role === "USER" || body.isActive === false);
  if (removesActiveAdmin && (await db.user.count({ where: { role: "ADMIN", isActive: true } })) <= 1) {
    throw new ApiError("Không thể khóa hoặc hạ quyền quản trị viên cuối cùng", 400);
  }
  if (id === admin.id && (body.role === "USER" || body.isActive === false)) {
    throw new ApiError("Bạn không thể tự khóa hoặc hạ quyền tài khoản của mình", 400);
  }

  const passwordHash = body.password ? await bcrypt.hash(body.password, 10) : undefined;
  await db.user.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.phone ? { phone: body.phone } : {}),
      ...(body.role ? { role: body.role } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      ...(passwordHash ? { passwordHash } : {}),
    },
  });
  return json({ ok: true });
});

export const DELETE = handler(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  if (id === admin.id) throw new ApiError("Bạn không thể tự xóa tài khoản đang đăng nhập", 400);

  await db.$transaction(async (tx) => {
    const target = await tx.user.findUnique({ where: { id } });
    if (!target) throw new ApiError("Không tìm thấy tài khoản", 404);
    if (
      target.role === "ADMIN" &&
      target.isActive &&
      (await tx.user.count({ where: { role: "ADMIN", isActive: true } })) <= 1
    ) {
      throw new ApiError("Không thể xóa quản trị viên cuối cùng", 400);
    }

    const projects = await tx.project.findMany({ where: { userId: id } });
    for (const project of projects) {
      const comments = await tx.comment.findMany({ where: { projectId: project.id } });
      for (const comment of comments) await tx.comment.delete({ where: { id: comment.id } });
      const hearts = await tx.heart.findMany({ where: { projectId: project.id } });
      for (const heart of hearts) await tx.heart.delete({ where: { userId_projectId: { userId: heart.userId, projectId: heart.projectId } } });
      const votes = await tx.vote.findMany({ where: { projectId: project.id } });
      for (const vote of votes) await tx.vote.delete({ where: { id: vote.id } });
      await tx.project.delete({ where: { id: project.id } });
    }

    const comments = await tx.comment.findMany({ where: { userId: id } });
    for (const comment of comments) await tx.comment.delete({ where: { id: comment.id } });
    const hearts = await tx.heart.findMany({ where: { userId: id } });
    for (const heart of hearts) await tx.heart.delete({ where: { userId_projectId: { userId: heart.userId, projectId: heart.projectId } } });
    const votes = await tx.vote.findMany({ where: { userId: id } });
    for (const vote of votes) await tx.vote.delete({ where: { id: vote.id } });
    const submissions = await tx.submission.findMany({ where: { userId: id } });
    for (const submission of submissions) await tx.submission.delete({ where: { id: submission.id } });
    const redemptions = await tx.redemption.findMany({ where: { userId: id } });
    for (const redemption of redemptions) await tx.redemption.delete({ where: { id: redemption.id } });
    const enrollments = await tx.enrollment.findMany({ where: { userId: id } });
    for (const enrollment of enrollments) {
      await tx.enrollment.update({ where: { id: enrollment.id }, data: { userId: null } });
    }
    await tx.user.delete({ where: { id } });
  });

  return json({ ok: true });
});
