"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "@/lib/client";
import { COURSES, STARS_PER_LESSON } from "@/lib/courses";

export default function SubmitForm() {
  const router = useRouter();
  const [slug, setSlug] = useState(COURSES[0].slug);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const course = COURSES.find((c) => c.slug === slug) ?? COURSES[0];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError("");
    setOk("");
    setBusy(true);
    const f = new FormData(form);
    const res = await sendJson("/api/submissions", "POST", {
      courseSlug: slug,
      lessonNo: f.get("lessonNo"),
      link: f.get("link"),
      note: f.get("note") || undefined,
    });
    setBusy(false);
    if (!res.ok) return setError(res.data?.error ?? "Có lỗi xảy ra");
    setOk(res.data.starsEarned > 0 ? `Đã nộp bài! Bạn nhận được ${res.data.starsEarned} ⭐` : "Đã cập nhật bài nộp.");
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <h2 className="text-2xl">Nộp bài</h2>
      <p className="text-base text-ink/70">
        Dán link dự án Scratch (hoặc link file <code>.sb3</code> đã tải lên Google Drive...). Lần nộp đầu tiên của mỗi bài được {STARS_PER_LESSON} ⭐.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="course" className="label">Khóa học</label>
          <select id="course" className="input" value={slug} onChange={(e) => setSlug(e.target.value)}>
            {COURSES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lessonNo" className="label">Bài học</label>
          <select id="lessonNo" name="lessonNo" className="input" key={slug}>
            {course.lessons.map((l) => (
              <option key={l.no} value={l.no}>Bài {l.no}: {l.title}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="link" className="label">Link bài làm *</label>
        <input id="link" name="link" type="url" required className="input" placeholder="https://scratch.mit.edu/projects/..." />
      </div>
      <div>
        <label htmlFor="note" className="label">Ghi chú cho giáo viên</label>
        <input id="note" name="note" className="input" maxLength={300} />
      </div>
      {error && <p className="alert-error" role="alert">{error}</p>}
      {ok && <p className="alert-ok">{ok}</p>}
      <button type="submit" disabled={busy} className="btn-secondary">{busy ? "Đang nộp..." : "Nộp bài"}</button>
    </form>
  );
}
