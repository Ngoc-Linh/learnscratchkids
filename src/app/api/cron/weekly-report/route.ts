import { db } from "@/lib/db";
import { handler, json } from "@/lib/api";
import { getCourse } from "@/lib/courses";
import { escapeHtml, sendMail } from "@/lib/mail";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Báo cáo tiến độ hằng tuần cho phụ huynh (Vercel Cron gọi vào mỗi sáng thứ Hai, xem vercel.json).
// Cần đặt CRON_SECRET; Vercel tự gửi kèm header "Authorization: Bearer <secret>".
export const GET = handler(async (req) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return json({ error: "Unauthorized" }, 401);
  }

  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const subs = await db.submission.findMany({
    where: { OR: [{ createdAt: { gte: since } }, { reviewedAt: { gte: since } }] },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          stars: true,
          enrollments: {
            where: { email: { not: null } },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { email: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const byUser = new Map<string, typeof subs>();
  for (const s of subs) byUser.set(s.userId, [...(byUser.get(s.userId) ?? []), s]);

  let sent = 0;
  for (const [, list] of byUser) {
    const u = list[0].user;
    const recipient = u.email ?? u.enrollments[0]?.email;
    if (!recipient) {
      console.warn(`[cron] bỏ qua báo cáo của ${u.id}: chưa có email phụ huynh`);
      continue;
    }
    const rows = list
      .map((s) => {
        const course = getCourse(s.courseSlug);
        const lesson = course?.lessons.find((l) => l.no === s.lessonNo);
        return `<li><b>${escapeHtml(course?.title ?? s.courseSlug)}</b> - Bài ${s.lessonNo}: ${escapeHtml(lesson?.title ?? "")}
${s.feedback ? `<br/><i>Nhận xét của giáo viên:</i> ${escapeHtml(s.feedback)}` : ""}</li>`;
      })
      .join("");

    const ok = await sendMail({
      to: recipient,
      subject: `[ScratchKids] Báo cáo tiến độ tuần này của ${u.name}`,
      html: `<p>Chào ${escapeHtml(u.name)},</p>
<p>Tuần qua bé đã nộp/cập nhật <b>${list.length}</b> bài:</p><ul>${rows}</ul>
<p>Tổng số sao hiện tại: <b>${u.stars} ⭐</b></p><p>ScratchKids</p>`,
    });
    if (ok) sent++;
  }

  return json({ users: byUser.size, emailsSent: sent });
});
