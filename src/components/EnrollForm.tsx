"use client";

import { useState } from "react";
import { sendJson } from "@/lib/client";
import { COURSES, LEARN_MODES } from "@/lib/courses";

type Props = {
  defaultCourse?: string;
  defaultTrial?: boolean;
  defaultName?: string;
};

export default function EnrollForm({ defaultCourse, defaultTrial = true, defaultName = "" }: Props) {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const res = await sendJson("/api/enrollments", "POST", {
      parentName: f.get("parentName"),
      phone: f.get("phone"),
      email: f.get("email") || undefined,
      childName: f.get("childName"),
      childAge: f.get("childAge"),
      courseSlug: f.get("courseSlug"),
      mode: f.get("mode"),
      isTrial: f.get("isTrial") === "on",
      note: f.get("note") || undefined,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.data?.error ?? "Có lỗi xảy ra, vui lòng thử lại");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="card text-center">
        <div className="text-6xl">🎉</div>
        <h2 className="mt-3 text-3xl">Đã nhận đăng ký!</h2>
        <p className="mt-2 text-ink/70">Chúng tôi sẽ liên hệ với phụ huynh qua số điện thoại trong thời gian sớm nhất.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="parentName" className="label">Họ tên phụ huynh *</label>
          <input id="parentName" name="parentName" className="input" required maxLength={60} defaultValue={defaultName} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="phone" className="label">Số điện thoại / Zalo *</label>
          <input id="phone" name="phone" type="tel" className="input" required autoComplete="tel" placeholder="09xx xxx xxx" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="email" className="label">Email (để nhận báo cáo học tập)</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" />
        </div>
        <div>
          <label htmlFor="childName" className="label">Tên của bé *</label>
          <input id="childName" name="childName" className="input" required maxLength={60} />
        </div>
        <div>
          <label htmlFor="childAge" className="label">Tuổi của bé *</label>
          <input id="childAge" name="childAge" type="number" min={5} max={16} className="input" required />
        </div>
      </div>

      <div>
        <label htmlFor="courseSlug" className="label">Khóa học quan tâm *</label>
        <select id="courseSlug" name="courseSlug" className="input" defaultValue={defaultCourse ?? COURSES[0].slug} required>
          {COURSES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.title} ({c.ageMin}-{c.ageMax} tuổi)
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="label">Hình thức học *</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {LEARN_MODES.map((m, i) => (
            <label key={m.value} className="flex cursor-pointer gap-3 rounded-2xl border-2 border-ink/10 p-4 has-[:checked]:border-scratch-500 has-[:checked]:bg-scratch-50">
              <input type="radio" name="mode" value={m.value} defaultChecked={i === 0} className="mt-1 h-5 w-5 accent-scratch-500" />
              <span>
                <span className="block font-display font-bold">{m.title}</span>
                <span className="block text-sm text-ink/70">{m.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-brand-50 p-4">
        <input type="checkbox" name="isTrial" defaultChecked={defaultTrial} className="h-5 w-5 accent-brand-500" />
        <span className="font-display font-bold">Tôi muốn đăng ký học thử miễn phí (0đ)</span>
      </label>

      <div>
        <label htmlFor="note" className="label">Ghi chú thêm</label>
        <textarea id="note" name="note" rows={3} maxLength={500} className="input" placeholder="Bé đã biết Scratch chưa? Thời gian học thuận tiện?" />
      </div>

      {error && <p className="alert-error" role="alert">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full sm:w-auto">
        {busy ? "Đang gửi..." : "Gửi đăng ký"}
      </button>
    </form>
  );
}
