import type { Metadata } from "next";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { safe } from "@/lib/db";
import { listProjects } from "@/lib/queries";
import ProjectCard from "@/components/ProjectCard";
import ShareProjectForm from "@/components/ShareProjectForm";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Showroom game và dự án Scratch do học viên ScratchKids tự thiết kế. Thả tim, bình luận và bình chọn Game của tháng.",
};
export const dynamic = "force-dynamic";

export default async function ShowroomPage() {
  const user = await getUser();
  const projects = await safe(() => listProjects({ userId: user?.id, take: 60 }), []);

  const top = [...projects].sort((a, b) => b.monthVotes - a.monthVotes)[0];
  const showChampion = top && top.monthVotes > 0;

  return (
    <div className="container-page py-12">
      <h1 className="text-4xl sm:text-5xl">Sản phẩm</h1>
      <p className="mt-2 max-w-2xl text-xl text-ink/70">
        Chơi thử game của các bạn, thả tim ❤️, bình luận 💬 và bình chọn “Game của tháng” 🏆 (mỗi tháng 1 phiếu).
      </p>

      {showChampion && (
        <div className="mt-8 rounded-3xl bg-gradient-to-r from-brand-100 to-amber-100 p-6 ring-2 ring-brand-200">
          <p className="font-display text-lg font-bold text-brand-700">🏆 Đang dẫn đầu Game của tháng</p>
          <p className="text-2xl font-display font-bold">{top.title}</p>
          <p className="text-base text-ink/70">{top.authorName} · {top.monthVotes} phiếu</p>
        </div>
      )}

      <div className="mt-8">
        {user ? (
          <ShareProjectForm />
        ) : (
          <div className="card flex flex-wrap items-center justify-between gap-3">
            <p className="text-lg">Đăng nhập để chia sẻ dự án, thả tim và bình luận.</p>
            <div className="flex gap-2">
              <Link href="/dang-nhap?next=/san-pham" className="btn-secondary btn-sm">Đăng nhập</Link>
              <Link href="/dang-ky" className="btn-ghost btn-sm">Tạo tài khoản</Link>
            </div>
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <p className="card mt-8 text-center">Chưa có dự án nào. Hãy là người đầu tiên chia sẻ game của mình! 🎮</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} loggedIn={!!user} />
          ))}
        </div>
      )}
    </div>
  );
}
