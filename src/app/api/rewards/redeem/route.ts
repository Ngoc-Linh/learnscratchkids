import { z } from "zod";
import { db } from "@/lib/db";
import { handler, json, readBody, requireUser, ApiError } from "@/lib/api";
import { getReward } from "@/lib/rewards";

const schema = z.object({ rewardId: z.string().min(1) });

// Đổi sao lấy quà. Trừ sao có điều kiện trong transaction để tránh âm sao khi bấm nhiều lần.
export const POST = handler(async (req) => {
  const user = await requireUser();
  const { rewardId } = await readBody(req, schema);
  const reward = getReward(rewardId);
  if (!reward) throw new ApiError("Phần quà không tồn tại", 404);

  await db.$transaction(async (tx) => {
    const updated = await tx.user.updateMany({
      where: { id: user.id, stars: { gte: reward.cost } },
      data: { stars: { decrement: reward.cost } },
    });
    if (updated.count === 0) throw new ApiError("Bạn chưa đủ sao để đổi phần quà này", 400);
    await tx.redemption.create({
      data: { userId: user.id, rewardId: reward.id, rewardName: reward.name, cost: reward.cost },
    });
  });

  return json({ ok: true });
});
