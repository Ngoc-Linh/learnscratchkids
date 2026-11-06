import type { MetadataRoute } from "next";
import { COURSES } from "@/lib/courses";
import { listPublishedGuideArticles } from "@/lib/guide-articles";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const fixed = ["", "/khoa-hoc", "/huong-dan-giai-de", "/san-pham"].map((path) => ({
    url: `${base}${path}`,
  }));
  const courses = COURSES.map((course) => ({
    url: `${base}/khoa-hoc/${course.slug}`,
  }));
  const guideArticles = await listPublishedGuideArticles();
  const guides = guideArticles.map((article) => ({
    url: `${base}/huong-dan-giai-de/${article.slug}`,
    lastModified: article.updatedAt,
  }));
  return [...fixed, ...courses, ...guides];
}
