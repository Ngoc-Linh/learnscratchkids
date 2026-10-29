import { z } from "zod";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { handler, json, readBody, requireAdmin } from "@/lib/api";
import { COURSES, getCourse } from "@/lib/courses";
import { escapeHtml, sendMail } from "@/lib/mail";

export const dynamic = "force-dynamic";

const schema = z.object({
  parentName: z.string().trim().min(2, "Vui lòng nhập họ tên phụ huynh").max(60),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s.\-()]/g, ""))
    .refine((v) => /^(\+?84|0)\d{9,10}$/.test(v), "Số điện thoại không hợp lệ"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(120)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || z.string().email().safeParse(v).success, "Email không hợp lệ"),
  childName: z.string().trim().min(1, "Vui lòng nhập tên của bé").max(60),
  childAge: z.coerce.number().int().min(5, "Độ tuổi từ 5 đến 16").max(16, "Độ tuổi từ 5 đến 16"),
  courseSlug: z.string().refine((v) => COURSES.some((c) => c.slug === v), "Khóa học không hợp lệ"),
  mode: z.enum(["VIDEO", "ONE_ON_ONE", "GROUP"]),
  isTrial: z.boolean().default(true),
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự").optional(),
});

// Công khai: phụ huynh gửi đăng ký học / học thử
export const POST = handler(async (req) => {
  const body = await readBody(req, schema);
  const user = await getUser();

  const enrollment = await db.enrollment.create({
    data: { ...body, note: body.note || null, userId: user?.id ?? null },
    select: { id: true },
  });

  const notify = process.env.NOTIFY_EMAIL;
  if (notify) {
    const course = getCourse(body.courseSlug);
    await sendMail({
      to: notify,
      subject: `[ScratchKids] Đăng ký ${body.isTrial ? "học thử" : "học"} mới: ${body.childName}`,
      html: `<p><b>Phụ huynh:</b> ${escapeHtml(body.parentName)} - ${escapeHtml(body.phone)}</p>
<p><b>Bé:</b> ${escapeHtml(body.childName)} (${body.childAge} tuổi)</p>
<p><b>Khóa học:</b> ${escapeHtml(course?.title ?? body.courseSlug)} - ${escapeHtml(body.mode)}</p>
<p><b>Ghi chú:</b> ${escapeHtml(body.note ?? "")}</p>`,
    });
  }

  return json({ ok: true, id: enrollment.id }, 201);
});

// Quản trị: danh sách đăng ký
export const GET = handler(async () => {
  await requireAdmin();
  const items = await db.enrollment.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return json({ items });
});
