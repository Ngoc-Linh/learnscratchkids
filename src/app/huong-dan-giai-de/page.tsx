import type { Metadata } from "next";
import Link from "next/link";
import SolutionGuide from "@/components/SolutionGuide";
import { db } from "@/lib/db";
import type { GuideArticle } from "@/lib/guide-seed";

export const metadata: Metadata = {
  title: "Hướng dẫn giải đề Scratch",
  description: "Bài giải Scratch mẫu hoàn chỉnh: đề bài, sơ đồ khối lệnh, thuật toán, giả mã và tình huống kiểm thử.",
};
export const dynamic = "force-dynamic";

export default async function SolutionGuidePage() {
  const articles = await db.guideArticle.findMany<GuideArticle>({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-page py-10 sm:py-14">
      <Link href="/khoa-hoc" className="font-display font-bold text-scratch-700 hover:underline">← Khám phá khóa học</Link>
      <header className="my-7 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-950 via-slate-900 to-scratch-900 p-7 text-white shadow-soft sm:p-10">
        <span className="chip border border-white/15 bg-white/10 text-white">SCRATCHKIDS · HỌC QUA DỰ ÁN</span>
        <h1 className="mt-4 max-w-3xl text-4xl sm:text-5xl">Hướng Dẫn Giải Đề</h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-white/75">
          Đọc đề, chia nhỏ bài toán, ghép khối lệnh và tự kiểm thử. Mỗi chuyên đề có đề mẫu, hình minh họa chương trình Scratch, giải thích thuật toán và bảng kiểm tra kết quả.
        </p>
      </header>
      <SolutionGuide articles={articles} />
    </div>
  );
}
