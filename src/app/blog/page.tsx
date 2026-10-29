import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Góc phụ huynh",
  description: "Phương pháp giáo dục con thời đại số, hướng dẫn thực hành Scratch cùng con tại nhà và định hướng năng khiếu công nghệ.",
};

export default function BlogPage() {
  const posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="container-page py-12">
      <h1 className="text-4xl sm:text-5xl">Góc phụ huynh</h1>
      <p className="mt-2 max-w-2xl text-xl text-ink/70">Cẩm nang đồng hành cùng con trong thời đại số.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="card block transition hover:-translate-y-1">
            <span className="chip bg-scratch-100 text-scratch-700">{p.category}</span>
            <h2 className="mt-3 text-xl">{p.title}</h2>
            <p className="mt-2 text-base text-ink/70">{p.excerpt}</p>
            <p className="mt-3 text-sm text-ink/50">{new Date(p.date).toLocaleDateString("vi-VN")}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
