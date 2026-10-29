// Danh mục quà đổi bằng sao. Chỉnh tên/giá trị sao tại đây.
export type Reward = { id: string; name: string; emoji: string; cost: number };

export const REWARDS: Reward[] = [
  { id: "pen", name: "Bút ScratchKids", emoji: "🖊️", cost: 50 },
  { id: "plush", name: "Gấu bông ScratchKids", emoji: "🧸", cost: 150 },
  { id: "stem", name: "Bộ đồ chơi STEM", emoji: "🧩", cost: 300 },
];

export function getReward(id: string): Reward | undefined {
  return REWARDS.find((r) => r.id === id);
}
