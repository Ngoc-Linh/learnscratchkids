import { db, isDatabaseConfigured } from "@/lib/db";
import { createGuideSeedArticles } from "@/lib/guide-seed";

export async function listPublishedGuideArticles() {
  if (!isDatabaseConfigured()) {
    return createGuideSeedArticles();
  }

  return db.guideArticle.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublishedGuideArticle(slug: string) {
  if (!isDatabaseConfigured()) {
    return createGuideSeedArticles().find((article) => article.slug === slug) ?? null;
  }

  const article = await db.guideArticle.findUnique({ where: { slug } });
  return article?.published ? article : null;
}
