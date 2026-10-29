import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { GuideArticle } from "@/lib/guide-seed";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.guideArticle.findUnique<GuideArticle>({ where: { slug } });
  if (!article?.published) return { title: "Không tìm thấy bài hướng dẫn" };
  return {
    title: article.title,
    description: article.summary,
  };
}

export default async function GuideArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await db.guideArticle.findUnique<GuideArticle>({ where: { slug } });
  if (!article?.published) notFound();

  const category = article.category === "EXAM" ? "Đề thi" : "Luyện tập";
  return (
    <article className="container-page py-10 sm:py-14">
      <Link href="/huong-dan-giai-de" className="font-display font-bold text-scratch-700 hover:underline">
        ← Tất cả bài hướng dẫn
      </Link>
      <header className="my-7 rounded-[2rem] bg-gradient-to-br from-indigo-950 via-slate-900 to-scratch-900 p-7 text-white shadow-soft sm:p-10">
        <span className="chip border border-white/15 bg-white/10 text-white">{category}</span>
        <h1 className="mt-4 max-w-4xl text-3xl sm:text-5xl">{article.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/75">{article.summary}</p>
      </header>

      <div className="space-y-7">
        <section className="card">
          <h2 className="font-display text-2xl font-extrabold">Nội dung đề bài</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-ink/75">{article.prompt}</p>
        </section>

        <section className="card">
          <h2 className="font-display text-2xl font-extrabold">Hình minh họa khối lệnh Scratch</h2>
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.imageAlt || article.title}
              width={1000}
              height={620}
              unoptimized
              className="mt-4 w-full rounded-2xl bg-slate-950"
            />
          ) : (
            <p className="mt-3 text-ink/60">Bài viết chưa có hình minh họa.</p>
          )}
          {article.blockCode && (
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-emerald-100">
              <code>{article.blockCode}</code>
            </pre>
          )}
        </section>

        <section className="card">
          <h2 className="font-display text-2xl font-extrabold">Thuật toán từng bước</h2>
          <ol className="mt-4 space-y-3">
            {article.algorithm.map((step: string, index: number) => (
              <li key={`${index}-${step}`} className="flex gap-3 leading-relaxed text-ink/75">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-scratch-100 font-display font-extrabold text-scratch-800">
                  {index + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="card">
          <h2 className="font-display text-2xl font-extrabold">Giải thích chi tiết</h2>
          <p className="mt-3 whitespace-pre-line leading-8 text-ink/75">{article.explanation}</p>
        </section>
      </div>
    </article>
  );
}
