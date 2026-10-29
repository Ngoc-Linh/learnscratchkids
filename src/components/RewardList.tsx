"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "@/lib/client";
import { REWARDS } from "@/lib/rewards";

export default function RewardList({ stars }: { stars: number }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function redeem(id: string, name: string) {
    if (!confirm(`Đổi quà "${name}"?`)) return;
    setBusyId(id);
    setMsg("");
    setError("");
    const res = await sendJson("/api/rewards/redeem", "POST", { rewardId: id });
    setBusyId("");
    if (!res.ok) return setError(res.data?.error ?? "Có lỗi xảy ra");
    setMsg("Đã gửi yêu cầu đổi quà! Trung tâm sẽ liên hệ để trao quà cho bé.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {REWARDS.map((r) => {
          const enough = stars >= r.cost;
          return (
            <div key={r.id} className="card text-center !p-5">
              <div className="text-5xl">{r.emoji}</div>
              <h3 className="mt-2 text-lg">{r.name}</h3>
              <p className="font-display font-bold text-brand-600">{r.cost} ⭐</p>
              <button
                type="button"
                disabled={!enough || busyId === r.id}
                onClick={() => redeem(r.id, r.name)}
                className="btn-primary btn-sm mt-3 w-full"
              >
                {enough ? "Đổi quà" : `Cần thêm ${r.cost - stars} ⭐`}
              </button>
            </div>
          );
        })}
      </div>
      {msg && <p className="alert-ok">{msg}</p>}
      {error && <p className="alert-error" role="alert">{error}</p>}
    </div>
  );
}
