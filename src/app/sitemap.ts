import type { MetadataRoute } from "next";
import { COURSES } from "@/lib/courses";
import { POSTS } from "@/lib/posts";
import { SITE } from "@/lib/site";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const fixed = ["", "/khoa-hoc", "/huong-dan-giai-de", "/san-pham", "/blog", "/dang-ky-hoc"].map((p) => ({ url: `${base}${p}` }));
  const courses = COURSES.map((c) => ({ url: `${base}/khoa-hoc/${c.slug}` }));
  const posts = POSTS.map((p) => ({ url: `${base}/blog/${p.slug}` }));
  const guideArticles = await db.guideArticle.findMany<{ slug: string; updatedAt: Date }>({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });
  const guides = guideArticles.map((article) => ({
    url: `${base}/huong-dan-giai-de/${article.slug}`,
    lastModified: article.updatedAt,
  }));
  return [...fixed, ...courses, ...posts, ...guides];
}
