import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="container-page max-w-3xl py-12">
      <Link href="/blog" className="font-display font-bold text-scratch-600 hover:underline">← Góc phụ huynh</Link>
      <span className="chip ml-3 bg-scratch-100 text-scratch-700">{post.category}</span>
      <h1 className="mt-4 text-3xl sm:text-4xl">{post.title}</h1>
      <p className="mt-2 text-sm text-ink/50">{new Date(post.date).toLocaleDateString("vi-VN")}</p>
      <div className="mt-8 space-y-4 text-xl leading-relaxed">
        {post.body.map((line, i) =>
          line.startsWith("## ") ? (
            <h2 key={i} className="pt-4 text-2xl">{line.slice(3)}</h2>
          ) : (
            <p key={i}>{line}</p>
          ),
        )}
      </div>
      <div className="card mt-12 text-center">
        <h2 className="text-2xl">Muốn con thử học Scratch?</h2>
        <Link href="/dang-ky-hoc?hoc-thu=1" className="btn-primary mt-4">Đăng ký học thử 0đ</Link>
      </div>
    </article>
  );
}
