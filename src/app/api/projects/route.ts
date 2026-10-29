import { z } from "zod";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { handler, json, readBody, requireUser } from "@/lib/api";
import { listProjects } from "@/lib/queries";

export const dynamic = "force-dynamic";

const schema = z.object({
  title: z.string().trim().min(3, "Tên dự án tối thiểu 3 ký tự").max(80, "Tên dự án tối đa 80 ký tự"),
  description: z.string().trim().max(300, "Mô tả tối đa 300 ký tự").optional(),
  scratchUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => {
      try {
        return new URL(v).protocol === "https:";
      } catch {
        return false;
      }
    }, "Vui lòng dán đường link bắt đầu bằng https://"),
});

export const GET = handler(async () => {
  const user = await getUser();
  const projects = await listProjects({ userId: user?.id });
  return json({ projects });
});

export const POST = handler(async (req) => {
  const user = await requireUser();
  const body = await readBody(req, schema);
  const project = await db.project.create({
    data: {
      title: body.title,
      description: body.description || null,
      scratchUrl: body.scratchUrl,
      authorName: user.name,
      userId: user.id,
    },
    select: { id: true },
  });
  return json({ ok: true, id: project.id }, 201);
});
