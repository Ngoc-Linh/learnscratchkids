"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "@/lib/client";

export default function ShareProjectForm({ userName }: { userName?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError("");
    setOk(false);
    setBusy(true);
    const f = new FormData(form);
    const res = await sendJson("/api/projects", "POST", {
      title: f.get("title"),
      description: f.get("description") || undefined,
      scratchUrl: f.get("scratchUrl"),
      authorName: userName ? undefined : f.get("authorName"),
    });
    setBusy(false);
    if (!res.ok) return setError(res.data?.error ?? "Có lỗi xảy ra");
    form.reset();
    setOk(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <h2 className="text-2xl">Chia sẻ dự án của bạn</h2>
      {userName ? (
        <p className="text-base text-ink/70">
          Dự án sẽ được đăng với tên <strong className="text-ink">{userName}</strong>.
        </p>
      ) : (
        <div>
          <label htmlFor="authorName" className="label">Tên hiển thị</label>
          <input
            id="authorName"
            name="authorName"
            className="input"
            maxLength={60}
            placeholder="Khách"
            autoComplete="nickname"
          />
          <p className="mt-1 text-sm text-ink/60">Bạn có thể để trống để đăng với tên Khách.</p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className="label">Tên dự án *</label>
          <input id="title" name="title" className="input" required minLength={3} maxLength={80} />
        </div>
        <div>
          <label htmlFor="scratchUrl" className="label">Link dự án Scratch *</label>
          <input id="scratchUrl" name="scratchUrl" type="url" className="input" required placeholder="https://scratch.mit.edu/projects/..." />
        </div>
      </div>
      <div>
        <label htmlFor="description" className="label">Mô tả ngắn</label>
        <input id="description" name="description" className="input" maxLength={300} />
      </div>
      {error && <p className="alert-error" role="alert">{error}</p>}
      {ok && <p className="alert-ok">Đã đăng dự án lên Showroom! 🎉</p>}
      <button type="submit" disabled={busy} className="btn-primary">{busy ? "Đang đăng..." : "Đăng dự án"}</button>
    </form>
  );
}
