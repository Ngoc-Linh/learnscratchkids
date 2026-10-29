import { db } from "./db";
import { monthKey } from "./scratch";
import type { ProjectView } from "./types";

export async function listProjects(opts: { userId?: string; take?: number } = {}): Promise<ProjectView[]> {
  const { userId, take = 30 } = opts;
  const month = monthKey();

  const projects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: { _count: { select: { hearts: true, comments: true } } },
  });
  const ids = projects.map((p) => p.id);
  if (ids.length === 0) return [];

  const [voteGroups, myHearts, myVote] = await Promise.all([
    db.vote.groupBy({
      by: ["projectId"],
      where: { month, projectId: { in: ids } },
      _count: { _all: true },
    }),
    userId
      ? db.heart.findMany({ where: { userId, projectId: { in: ids } }, select: { projectId: true } })
      : Promise.resolve([] as { projectId: string }[]),
    userId
      ? db.vote.findUnique({
          where: { userId_month: { userId, month } },
          select: { projectId: true },
        })
      : Promise.resolve(null),
  ]);

  const voteCount = new Map(voteGroups.map((g) => [g.projectId, g._count._all]));
  const hearted = new Set(myHearts.map((h) => h.projectId));

  return projects.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    scratchUrl: p.scratchUrl,
    authorName: p.authorName,
    createdAt: p.createdAt.toISOString(),
    hearts: p._count.hearts,
    comments: p._count.comments,
    monthVotes: voteCount.get(p.id) ?? 0,
    hearted: hearted.has(p.id),
    voted: myVote?.projectId === p.id,
  }));
}
