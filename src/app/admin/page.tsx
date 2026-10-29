import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCourse, LEARN_MODES } from "@/lib/courses";
import { formatDate } from "@/lib/client";
import { AccountManager, CreateAccountForm, EnrollmentStatus, ReviewForm } from "@/components/AdminPanel";
import AdminGuideArticles from "@/components/AdminGuideArticles";
import type { GuideArticle } from "@/lib/guide-seed";

export const metadata: Metadata = { title: "Quản trị", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getUser();
  if (!user) redirect("/dang-nhap?next=/admin");
  if (user.role !== "ADMIN") notFound();

  const [enrollments, submissions, redemptions, users, guideArticles, enrollmentCount, trialCount, newTrialCount] = await Promise.all([
    db.enrollment.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.submission.findMany({
      orderBy: [{ reviewedAt: { sort: "asc", nulls: "first" } }, { updatedAt: "desc" }],
      take: 50,
      include: { user: { select: { name: true, phone: true } } },
    }),
    db.redemption.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { user: { select: { name: true, phone: true } } },
    }),
    db.user.findMany<{
      id: string;
      name: string;
      phone: string | null;
      role: "USER" | "ADMIN";
      isActive: boolean;
      stars: number;
      createdAt: Date;
    }>({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, phone: true, role: true, isActive: true, stars: true, createdAt: true },
    }),
    db.guideArticle.findMany<GuideArticle>({ orderBy: { updatedAt: "desc" } }),
    db.enrollment.count(),
    db.enrollment.count({ where: { isTrial: true } }),
    db.enrollment.count({ where: { isTrial: true, status: "NEW" } }),
  ]);

  const modeLabel = (v: string) => LEARN_MODES.find((m) => m.value === v)?.title ?? v;
  const activeUsers = users.filter((account) => account.isActive).length;
  const pendingEnrollments = enrollments.filter((enrollment) => enrollment.status === "NEW").length;

  return (
    <div className="container-page space-y-10 py-8 sm:py-12">
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-7 text-white shadow-soft sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-20 h-72 w-72 rounded-full bg-scratch-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="chip border border-white/15 bg-white/10 text-white">SCRATCHKIDS · ADMIN</span>
            <h1 className="mt-4 text-4xl sm:text-5xl">Bảng điều khiển</h1>
            <p className="mt-2 max-w-2xl text-base text-white/70 sm:text-lg">
              Xin chào {user.name}. Theo dõi học viên, đăng ký học thử và hoạt động học tập tại một nơi.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur">
            <p className="text-sm text-white/65">Ngày hôm nay</p>
            <p className="font-display text-xl font-bold">{formatDate(new Date().toISOString())}</p>
          </div>
        </div>
        <nav aria-label="Điều hướng bảng quản trị" className="relative mt-8 flex gap-2 overflow-x-auto whitespace-nowrap pb-2">
          {[
            ["#tong-quan", "Tổng quan"],
            ["#tai-khoan", "Tài khoản"],
            ["#bai-huong-dan", "Bài hướng dẫn"],
            ["#dang-ky-hoc", "Đăng ký học"],
            ["#bai-nop", "Bài nộp"],
            ["#doi-qua", "Đổi quà"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="shrink-0 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white/85 transition hover:bg-white/15">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <section id="tong-quan" className="grid scroll-mt-28 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card relative overflow-hidden border-l-4 border-l-scratch-400 !p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-ink/50">Tổng tài khoản</p>
          <p className="mt-2 font-display text-4xl font-extrabold">{users.length}</p>
          <p className="mt-1 text-sm text-ink/55">{activeUsers} tài khoản đang hoạt động</p>
        </div>
        <div className="card border-l-4 border-l-brand-400 !p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-ink/50">Đăng ký học thử</p>
          <p className="mt-2 font-display text-4xl font-extrabold">{trialCount}</p>
          <p className="mt-1 text-sm text-ink/55">Tất cả thời điểm</p>
        </div>
        <div className="card border-l-4 border-l-amber-400 !p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-ink/50">Cần liên hệ</p>
          <p className="mt-2 font-display text-4xl font-extrabold">{newTrialCount}</p>
          <p className="mt-1 text-sm text-ink/55">Yêu cầu học thử mới</p>
        </div>
        <div className="card border-l-4 border-l-violet-400 !p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-ink/50">Đăng ký chờ xử lý</p>
          <p className="mt-2 font-display text-4xl font-extrabold">{pendingEnrollments}</p>
          <p className="mt-1 text-sm text-ink/55">Trên {enrollmentCount} lượt đăng ký</p>
        </div>
      </section>

      <section id="tai-khoan" className="scroll-mt-28">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-widest text-scratch-600">Quản lý người dùng</p>
            <h2 className="mt-1 text-3xl">Tài khoản <span className="text-ink/45">({users.length})</span></h2>
          </div>
          <p className="text-sm text-ink/60">Chỉnh sửa thông tin, vai trò, trạng thái hoặc xóa tài khoản.</p>
        </div>
        <div className="card overflow-x-auto !p-0">
          <CreateAccountForm />
          <table className="w-full min-w-[70rem] text-left text-sm">
            <thead className="bg-ink/5 font-display">
              <tr>
                <th className="p-3">Ngày tạo</th>
                <th className="p-3">Thông tin tài khoản / chỉnh sửa</th>
                <th className="p-3">Sao</th>
                <th className="p-3">Trạng thái / thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={4} className="p-4 text-center text-ink/60">Chưa có tài khoản nào.</td></tr>
              )}
              {users.map((account) => (
                <AccountManager
                  key={account.id}
                  user={{ ...account, createdAt: account.createdAt.toISOString() }}
                  currentUserId={user.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="bai-huong-dan" className="scroll-mt-28">
        <div className="mb-4">
          <p className="text-sm font-extrabold uppercase tracking-widest text-indigo-600">Nội dung học tập</p>
          <h2 className="mt-1 text-3xl">Quản lý bài hướng dẫn giải đề</h2>
          <p className="mt-2 max-w-3xl text-ink/60">
            Tạo bài trong mục Luyện tập hoặc Đề thi, tải hình minh họa, chỉnh sửa nội dung và bật/tắt công khai.
          </p>
        </div>
        <AdminGuideArticles articles={guideArticles} />
      </section>

      <section id="dang-ky-hoc" className="scroll-mt-28">
        <div className="mb-4">
          <p className="text-sm font-extrabold uppercase tracking-widest text-brand-600">Tuyển sinh</p>
          <h2 className="mt-1 text-3xl">Đăng ký học <span className="text-ink/45">({enrollmentCount})</span></h2>
        </div>
        <div className="card overflow-x-auto !p-0">
          <table className="w-full min-w-[56rem] text-left text-base">
            <thead className="bg-ink/5 font-display">
              <tr>
                <th className="p-3">Ngày</th>
                <th className="p-3">Phụ huynh</th>
                <th className="p-3">Bé</th>
                <th className="p-3">Khóa học</th>
                <th className="p-3">Ghi chú</th>
                <th className="p-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-ink/60">Chưa có đăng ký nào.</td></tr>
              )}
              {enrollments.map((e) => (
                <tr key={e.id} className="border-t border-ink/10 align-top">
                  <td className="p-3 whitespace-nowrap">{formatDate(e.createdAt.toISOString())}</td>
                  <td className="p-3">
                    <b>{e.parentName}</b>
                    <br />
                    <a href={`tel:${e.phone}`} className="text-scratch-700 underline">{e.phone}</a>
                    {e.email && <><br />{e.email}</>}
                  </td>
                  <td className="p-3">{e.childName} ({e.childAge} tuổi)</td>
                  <td className="p-3">
                    {getCourse(e.courseSlug)?.title ?? e.courseSlug}
                    <br />
                    <span className="text-sm text-ink/60">{modeLabel(e.mode)}{e.isTrial ? " · học thử" : ""}</span>
                  </td>
                  <td className="p-3 max-w-[16rem]">{e.note}</td>
                  <td className="p-3"><EnrollmentStatus id={e.id} status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="bai-nop" className="scroll-mt-28">
        <div className="mb-4">
          <p className="text-sm font-extrabold uppercase tracking-widest text-violet-600">Lớp học</p>
          <h2 className="mt-1 text-3xl">Bài nộp <span className="text-base font-semibold text-ink/50">(bài chờ nhận xét hiển thị trước)</span></h2>
        </div>
        <div className="space-y-3">
          {submissions.length === 0 && <p className="card text-ink/60">Chưa có bài nộp.</p>}
          {submissions.map((s) => {
            const course = getCourse(s.courseSlug);
            const lesson = course?.lessons.find((l) => l.no === s.lessonNo);
            return (
              <div key={s.id} className="card !p-4">
                <p className="font-display font-bold">
                  {s.user.name} <span className="font-normal text-ink/60">({s.user.phone ?? "Chưa có số điện thoại"})</span> · {course?.title} - Bài {s.lessonNo}: {lesson?.title}
                  {!s.reviewedAt && <span className="chip ml-2 bg-brand-100 text-brand-700">Chờ nhận xét</span>}
                </p>
                <a href={s.link} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-scratch-700 underline">{s.link}</a>
                {s.note && <p className="text-sm text-ink/70">Ghi chú của bé: {s.note}</p>}
                <div className="mt-2">
                  <ReviewForm id={s.id} feedback={s.feedback ?? ""} bonusStars={s.bonusStars} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="doi-qua" className="scroll-mt-28">
        <div className="mb-4">
          <p className="text-sm font-extrabold uppercase tracking-widest text-amber-600">Phần thưởng</p>
          <h2 className="mt-1 text-3xl">Yêu cầu đổi quà</h2>
        </div>
        <div className="card">
          {redemptions.length === 0 ? (
            <p className="text-ink/60">Chưa có yêu cầu nào.</p>
          ) : (
            <ul className="space-y-1 text-base">
              {redemptions.map((r) => (
                <li key={r.id}>
                  {formatDate(r.createdAt.toISOString())} · <b>{r.user.name}</b> ({r.user.phone ?? "Chưa có số điện thoại"}) đổi <b>{r.rewardName}</b> (-{r.cost} ⭐)
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
