import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { db, isDatabaseConfigured, safe } from "@/lib/db";
import { listProjects } from "@/lib/queries";
import ProjectCard from "@/components/ProjectCard";
import ShareProjectForm from "@/components/ShareProjectForm";
import PythonSubmission from "@/components/PythonSubmission";
import ProductTabs from "@/components/ProductTabs";
import { PYTHON_COURSE_SLUG, PYTHON_ENROLLMENT_COURSE_SLUG, PYTHON_LESSON_NO } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Khám phá dự án Scratch, viết và chạy Python ngay trên trình duyệt, nộp bài cho giáo viên.",
  alternates: { canonical: "/san-pham" },
};
export const dynamic = "force-dynamic";

export default async function ShowroomPage() {
  const user = await getUser();
  const [projects, pythonEnrollment] = isDatabaseConfigured()
    ? await Promise.all([
        safe(() => listProjects({ userId: user?.id, take: 60 }), []),
        user
          ? safe(
              () => db.enrollment.findFirst({
                where: {
                  userId: user.id,
                  courseSlug: PYTHON_ENROLLMENT_COURSE_SLUG,
                  status: "ENROLLED",
                },
                select: { id: true },
              }),
              null,
            )
          : Promise.resolve(null),
      ])
    : [[], null];
  const pythonSubmission = user && pythonEnrollment
    ? await safe(
        () =>
          db.submission.findUnique({
            where: {
              userId_courseSlug_lessonNo: {
                userId: user.id,
                courseSlug: PYTHON_COURSE_SLUG,
                lessonNo: PYTHON_LESSON_NO,
              },
            },
            select: { pythonCode: true, note: true },
          }),
        null,
      )
    : null;

  const top = [...projects].sort((a, b) => b.monthVotes - a.monthVotes)[0];
  const showChampion = top && top.monthVotes > 0;

  return (
    <div className="container-page py-12">
      <h1 className="text-4xl sm:text-5xl">Sản phẩm</h1>
      <p className="mt-2 max-w-2xl text-xl text-ink/70">
        Khám phá sản phẩm Scratch hoặc tự viết và chạy chương trình Python ngay trên trình duyệt.
      </p>

      <ProductTabs
        scratch={
          <>
            <p className="mb-6 max-w-2xl text-base text-ink/70">
              Chơi thử game của các bạn, thả tim ❤️, bình luận 💬 và bình chọn “Game của tháng” 🏆 (mỗi tháng 1 phiếu).
            </p>
            {showChampion && (
              <div className="mb-8 rounded-3xl bg-gradient-to-r from-brand-100 to-amber-100 p-6 ring-2 ring-brand-200">
                <p className="font-display text-lg font-bold text-brand-700">🏆 Đang dẫn đầu Game của tháng</p>
                <p className="text-2xl font-display font-bold">{top.title}</p>
                <p className="text-base text-ink/70">{top.authorName} · {top.monthVotes} phiếu</p>
              </div>
            )}
            <ShareProjectForm userName={user?.name} />
            {projects.length === 0 ? (
              <p className="card mt-8 text-center">Chưa có dự án nào. Hãy là người đầu tiên chia sẻ game của mình! 🎮</p>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                {projects.map((p) => (
                  <ProjectCard key={p.id} project={p} loggedIn={!!user} />
                ))}
              </div>
            )}
          </>
        }
        python={
          <div id="python" className="scroll-mt-28">
            <div className="mb-5">
              <p className="text-sm font-extrabold uppercase tracking-widest text-scratch-600">Lập trình Python</p>
              <h2 className="mt-1 text-3xl sm:text-4xl">Viết, chạy và nộp bài Python</h2>
              <p className="mt-2 max-w-2xl text-ink/70">
                Soạn mã, chạy thử và gửi bài cho giáo viên nhận xét. Chương trình được chạy trong trình duyệt của bạn.
              </p>
            </div>
            <PythonSubmission
              loggedIn={!!user}
              userName={user?.name}
              canSubmit={!!pythonEnrollment}
              initialCode={pythonSubmission?.pythonCode ?? ""}
              initialNote={pythonSubmission?.note ?? ""}
            />
          </div>
        }
      />
    </div>
  );
}
