"use client";

import { useState } from "react";
import { sendJson, formatDate } from "@/lib/client";
import { scratchId, scratchEmbedUrl, scratchThumbUrl } from "@/lib/scratch";
import type { CommentView, ProjectView } from "@/lib/types";

export default function ProjectCard({ project, loggedIn }: { project: ProjectView; loggedIn: boolean }) {
  const [p, setP] = useState(project);
  const [playing, setPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentView[] | null>(null);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");

  const id = scratchId(p.scratchUrl);

  function needLogin(): boolean {
    if (loggedIn) return false;
    setMsg("Hãy đăng nhập để thả tim, bình chọn và bình luận nhé!");
    return true;
  }

  async function toggleHeart() {
    if (needLogin()) return;
    const res = await sendJson(`/api/projects/${p.id}/heart`, "POST");
    if (!res.ok) return setMsg(res.data?.error ?? "Có lỗi xảy ra");
    setMsg("");
    setP((old) => ({ ...old, hearted: res.data.hearted, hearts: res.data.hearts }));
  }

  async function toggleVote() {
    if (needLogin()) return;
    const res = await sendJson(`/api/projects/${p.id}/vote`, "POST");
    if (!res.ok) return setMsg(res.data?.error ?? "Có lỗi xảy ra");
    setMsg(res.data.voted ? "Cảm ơn bạn đã bình chọn! (Mỗi tháng được 1 phiếu, chọn dự án khác sẽ đổi phiếu)" : "Đã bỏ phiếu bình chọn.");
    setP((old) => ({ ...old, voted: res.data.voted, monthVotes: res.data.monthVotes }));
  }

  async function openComments() {
    const next = !showComments;
    setShowComments(next);
    if (next && comments === null) {
      const res = await fetch(`/api/projects/${p.id}/comments`);
      const data = await res.json().catch(() => ({ comments: [] }));
      setComments(data.comments ?? []);
    }
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (needLogin()) return;
    const res = await sendJson(`/api/projects/${p.id}/comments`, "POST", { content: text });
    if (!res.ok) return setMsg(res.data?.error ?? "Có lỗi xảy ra");
    setMsg("");
    setText("");
    setComments((old) => [...(old ?? []), res.data.comment]);
    setP((old) => ({ ...old, comments: old.comments + 1 }));
  }

  async function removeComment(cid: string) {
    const res = await sendJson(`/api/comments/${cid}`, "DELETE");
    if (!res.ok) return setMsg(res.data?.error ?? "Có lỗi xảy ra");
    setComments((old) => (old ?? []).filter((c) => c.id !== cid));
    setP((old) => ({ ...old, comments: Math.max(0, old.comments - 1) }));
  }

  return (
    <article className="card flex flex-col gap-3 !p-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-scratch-50">
        {id && playing ? (
          <iframe
            src={scratchEmbedUrl(id)}
            title={p.title}
            className="absolute inset-0 h-full w-full"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            onClick={() => (id ? setPlaying(true) : window.open(p.scratchUrl, "_blank", "noopener,noreferrer"))}
            className="group absolute inset-0 grid place-items-center"
            aria-label={`Chơi thử ${p.title}`}
          >
            {id && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={scratchThumbUrl(id)} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            )}
            <span className="relative rounded-full bg-white/90 px-5 py-2 font-display text-lg font-bold shadow-pop group-hover:bg-white">
              ▶ {id ? "Chơi thử" : "Mở dự án"}
            </span>
          </button>
        )}
      </div>

      <div>
        <h3 className="text-xl">{p.title}</h3>
        <p className="text-sm text-ink/60">
          {p.authorName} · {formatDate(p.createdAt)}
        </p>
        {p.description && <p className="mt-1 text-base text-ink/80">{p.description}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleHeart}
          aria-pressed={p.hearted}
          className={`btn-sm btn ${p.hearted ? "bg-rose-100 text-rose-700" : "bg-ink/5"}`}
        >
          {p.hearted ? "❤️" : "🤍"} {p.hearts}
        </button>
        <button type="button" onClick={openComments} className="btn-sm btn bg-ink/5">
          💬 {p.comments}
        </button>
        <button
          type="button"
          onClick={toggleVote}
          aria-pressed={p.voted}
          className={`btn-sm btn ml-auto ${p.voted ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-700"}`}
        >
          🏆 {p.voted ? "Đã bình chọn" : "Game của tháng"} ({p.monthVotes})
        </button>
      </div>

      {msg && <p className="text-sm font-semibold text-scratch-700">{msg}</p>}

      {showComments && (
        <div className="space-y-2 border-t border-ink/10 pt-3">
          {comments === null && <p className="text-sm">Đang tải...</p>}
          {comments?.length === 0 && <p className="text-sm text-ink/60">Chưa có bình luận nào. Hãy là người đầu tiên!</p>}
          {comments?.map((c) => (
            <div key={c.id} className="rounded-2xl bg-ink/5 px-3 py-2 text-base">
              <b>{c.userName}</b>: {c.content}
              {c.mine && (
                <button type="button" onClick={() => removeComment(c.id)} className="ml-2 text-sm text-rose-600 hover:underline">
                  Xóa
                </button>
              )}
            </div>
          ))}
          <form onSubmit={addComment} className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={300}
              required
              placeholder="Viết bình luận tích cực nhé..."
              className="input !py-2 !text-base"
              aria-label="Bình luận"
            />
            <button type="submit" className="btn-secondary btn-sm">Gửi</button>
          </form>
        </div>
      )}
    </article>
  );
}
