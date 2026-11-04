import { readFile } from "node:fs/promises";
import path from "node:path";
import { Prisma, PrismaClient } from "@prisma/client";

type LegacyDatabase = {
  user?: Record<string, unknown>[];
  enrollment?: Record<string, unknown>[];
  project?: Record<string, unknown>[];
  comment?: Record<string, unknown>[];
  heart?: Record<string, unknown>[];
  vote?: Record<string, unknown>[];
  submission?: Record<string, unknown>[];
  redemption?: Record<string, unknown>[];
  guideArticle?: Record<string, unknown>[];
};

const db = new PrismaClient();
const databasePath = path.join(process.cwd(), "scratchkids.json");

function rows<T>(items: Record<string, unknown>[] | undefined, dateFields: string[] = []): T[] {
  return (items ?? []).map((item) => {
    const row = { ...item };
    for (const field of dateFields) {
      const value = row[field];
      if (typeof value === "string") row[field] = new Date(value);
    }
    return row as T;
  });
}

async function main() {
  const legacy = JSON.parse(await readFile(databasePath, "utf8")) as LegacyDatabase;
  await db.$transaction(async (tx) => {
    const users = rows<Prisma.UserCreateManyInput>(legacy.user, ["createdAt"]);
    const projects = rows<Prisma.ProjectCreateManyInput>(legacy.project, ["createdAt"]);
    const enrollments = rows<Prisma.EnrollmentCreateManyInput>(legacy.enrollment, ["createdAt"]);
    const comments = rows<Prisma.CommentCreateManyInput>(legacy.comment, ["createdAt"]);
    const hearts = rows<Prisma.HeartCreateManyInput>(legacy.heart, ["createdAt"]);
    const votes = rows<Prisma.VoteCreateManyInput>(legacy.vote, ["createdAt"]);
    const submissions = rows<Prisma.SubmissionCreateManyInput>(legacy.submission, ["createdAt", "updatedAt", "reviewedAt"]);
    const redemptions = rows<Prisma.RedemptionCreateManyInput>(legacy.redemption, ["createdAt"]);
    const guideArticles = rows<Prisma.GuideArticleCreateManyInput>(legacy.guideArticle, ["createdAt", "updatedAt"]);

    if (users.length) await tx.user.createMany({ data: users, skipDuplicates: true });
    if (projects.length) await tx.project.createMany({ data: projects, skipDuplicates: true });
    if (enrollments.length) await tx.enrollment.createMany({ data: enrollments, skipDuplicates: true });
    if (comments.length) await tx.comment.createMany({ data: comments, skipDuplicates: true });
    if (hearts.length) await tx.heart.createMany({ data: hearts, skipDuplicates: true });
    if (votes.length) await tx.vote.createMany({ data: votes, skipDuplicates: true });
    if (submissions.length) await tx.submission.createMany({ data: submissions, skipDuplicates: true });
    if (redemptions.length) await tx.redemption.createMany({ data: redemptions, skipDuplicates: true });
    if (guideArticles.length) await tx.guideArticle.createMany({ data: guideArticles, skipDuplicates: true });

    await tx.appSetting.upsert({
      where: { key: "guide-articles-seeded" },
      update: {},
      create: { key: "guide-articles-seeded", value: "true" },
    });
  }, { timeout: 120_000 });

  console.log("Đã nhập dữ liệu từ scratchkids.json vào PostgreSQL.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
