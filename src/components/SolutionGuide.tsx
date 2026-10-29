"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { GuideArticle, GuideCategory } from "@/lib/guide-seed";

const categories: { id: GuideCategory; label: string; description: string }[] = [
  { id: "PRACTICE", label: "Luyện tập", description: "Bài tập thực hành theo từng kỹ năng Scratch." },
  { id: "EXAM", label: "Đề thi", description: "Đề mẫu tổng hợp kèm hướng giải và cách tự kiểm tra." },
];

export default function SolutionGuide({ articles }: { articles: GuideArticle[] }) {
  const [activeCategory, setActiveCategory] = useState<GuideCategory>("PRACTICE");
  const visibleArticles = articles.filter((article) => article.category === activeCategory);
  const activeTab = categories.find((category) => category.id === activeCategory)!;

  return (
    <section>
      <div role="tablist" aria-label="Danh mục hướng dẫn giải đề" className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => {
          const selected = category.id === activeCategory;
          const count = articles.filter((article) => article.category === category.id).length;
          return (
            <button
              key={category.id}
              id={`guide-tab-${category.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`guide-panel-${category.id}`}
              onClick={() => setActiveCategory(category.id)}
              className={`rounded-2xl border p-5 text-left transition ${
                selected
                  ? "border-scratch-500 bg-scratch-50 shadow-soft"
                  : "border-ink/10 bg-white hover:border-scratch-300"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="whitespace-nowrap font-display text-2xl font-extrabold">{category.label}</span>
                <span className="chip shrink-0 whitespace-nowrap bg-ink/5 text-ink/70">{count} bài</span>
              </span>
              <span className="mt-1 block text-sm text-ink/60">{category.description}</span>
            </button>
          );
        })}
      </div>

      <div
        id={`guide-panel-${activeCategory}`}
        role="tabpanel"
        aria-labelledby={`guide-tab-${activeCategory}`}
        className="mt-7"
      >
        <div className="mb-4">
          <h2 className="font-display text-3xl font-extrabold">{activeTab.label}</h2>
          <p className="mt-1 text-ink/60">{activeTab.description}</p>
        </div>
        {visibleArticles.length === 0 ? (
          <p className="card text-ink/60">Chưa có bài viết trong mục này.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {visibleArticles.map((article) => (
              <article key={article.id} className="card overflow-hidden !p-0">
                {article.imageUrl ? (
                  <Image
                    src={article.imageUrl}
                    alt={article.imageAlt || article.title}
                    width={1000}
                    height={620}
                    unoptimized
                    className="aspect-[16/9] w-full bg-slate-950 object-cover"
                  />
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-indigo-950 to-scratch-800 text-6xl" aria-hidden="true">
                    🧩
                  </div>
                )}
                <div className="p-5">
                  <span className="chip bg-scratch-100 text-scratch-800">{activeTab.label}</span>
                  <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight">{article.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink/65">{article.summary}</p>
                  <Link href={`/huong-dan-giai-de/${article.slug}`} className="btn-primary btn-sm mt-5">
                    Xem lời giải chi tiết <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
