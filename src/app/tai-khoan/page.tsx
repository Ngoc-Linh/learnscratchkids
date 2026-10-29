import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { db, safe } from "@/lib/db";
import { COURSES, getCourse, STARS_PER_LESSON } from "@/lib/courses";
import { formatDate } from "@/lib/client";
import SubmitForm from "@/components/SubmitForm";
import RewardList from "@/components/RewardList";

export const metadata: Metadata = { title: "Tài khoản của tôi" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("/dang-nhap?next=/tai-khoan");

  const [submissions, redemptions] = await Promise.all([
    safe(
      () => db.submission.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } }),
      [],
    ),
    safe(
      () => db.redemption.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10 }),
      [],
    ),
  ]);

  const done = new Set(submissions.map((s) => `${s.courseSlug}:${s.lessonNo}`));

  return (
    <div className="container-page space-y-10 py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl">Xin chào, {user.name}!</h1>
          <p className="text-base text-ink/60">{user.phone ?? "Chưa cập nhật số điện thoại"}</p>
        </div>
        <div className="rounded-3xl bg-brand-100 px-8 py-4 text-center shadow-pop">
          <p className="text-sm font-bold text-brand-700">Số sao của bạn</p>
          <p className="font-display text-4xl font-extrabold text-brand-600">⭐ {user.stars}</p>
        </div>
      </header>

      <section>
        <h2 className="section-title mb-4">Tiến độ học tập</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {COURSES.map((c) => {
            const n = c.lessons.filter((l) => done.has(`${c.slug}:${l.no}`)).length;
            const pct = Math.round((n / c.lessons.length) * 100);
            return (
              <div key={c.slug} className="card !p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg">{c.emoji} {c.title}</h3>
                  <span className="font-display font-bold">{n}/{c.lessons.length}</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-scratch-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <SubmitForm />
        <div className="card">
          <h2 className="text-2xl">Bài đã nộp</h2>
          {submissions.length === 0 ? (
            <p className="mt-3 text-base text-ink/60">Chưa có bài nộp nào. Mỗi bài nộp lần đầu nhận {STARS_PER_LESSON} ⭐.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {submissions.map((s) => {
                const course = getCourse(s.courseSlug);
                const lesson = course?.lessons.find((l) => l.no === s.lessonNo);
                return (
                  <li key={s.id} className="rounded-2xl bg-ink/5 p-3 text-base">
                    <p className="font-display font-bold">{course?.title} - Bài {s.lessonNo}: {lesson?.title}</p>
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-scratch-700 underline">{s.link}</a>
                    <p className="text-sm text-ink/60">Nộp {formatDate(s.updatedAt.toISOString())}</p>
                    {s.feedback ? (
                      <p className="mt-1 rounded-xl bg-emerald-50 p-2 text-emerald-800">👩‍🏫 {s.feedback}</p>
                    ) : (
                      <p className="mt-1 text-sm text-ink/50">Đang chờ giáo viên nhận xét</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="section-title mb-4">Đổi quà</h2>
        <RewardList stars={user.stars} />
        {redemptions.length > 0 && (
          <div className="card mt-6">
            <h3 className="text-xl">Quà đã đổi</h3>
            <ul className="mt-2 space-y-1 text-base">
              {redemptions.map((r) => (
                <li key={r.id}>
                  {r.rewardName} (-{r.cost} ⭐) · {formatDate(r.createdAt.toISOString())} ·{" "}
                  <span className="font-bold">{r.status === "PENDING" ? "Đang xử lý" : r.status}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
