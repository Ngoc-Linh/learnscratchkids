"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDate, sendJson } from "@/lib/client";

export function EnrollmentStatus({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [error, setError] = useState("");

  async function change(next: string) {
    const prev = value;
    setValue(next);
    setError("");
    const res = await sendJson(`/api/enrollments/${id}`, "PATCH", { status: next });
    if (!res.ok) {
      setValue(prev);
      setError(res.data?.error ?? "Lỗi");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <select value={value} onChange={(e) => change(e.target.value)} className="input !py-1.5 !text-base" aria-label="Trạng thái">
        <option value="NEW">Mới</option>
        <option value="CONTACTED">Đã liên hệ</option>
        <option value="ENROLLED">Đã nhập học</option>
        <option value="CANCELLED">Đã hủy</option>
      </select>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}

export function ReviewForm({ id, feedback, bonusStars }: { id: string; feedback: string; bonusStars: number }) {
  const router = useRouter();
  const [text, setText] = useState(feedback);
  const [bonus, setBonus] = useState(bonusStars);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const res = await sendJson(`/api/submissions/${id}`, "PATCH", { feedback: text, bonusStars: bonus });
    setBusy(false);
    setMsg(res.ok ? "Đã lưu" : (res.data?.error ?? "Lỗi"));
    if (res.ok) router.refresh();
  }

  return (
    <form onSubmit={save} className="flex flex-wrap items-center gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Nhận xét cho bé..."
        maxLength={1000}
        className="input !py-1.5 !text-base min-w-[12rem] flex-1"
        aria-label="Nhận xét"
      />
      <label className="flex items-center gap-1 text-sm font-bold">
        +⭐
        <input
          type="number"
          min={0}
          max={20}
          value={bonus}
          onChange={(e) => setBonus(Number(e.target.value))}
          className="input !w-20 !py-1.5 !text-base"
        />
      </label>
      <button type="submit" disabled={busy} className="btn-secondary btn-sm">Lưu</button>
      {msg && <span className="text-sm font-semibold">{msg}</span>}
    </form>
  );
}

export type AdminUser = {
  id: string;
  name: string;
  phone: string | null;
  role: "USER" | "ADMIN";
  isActive: boolean;
  stars: number;
  createdAt: string;
};

export function AccountManager({ user, currentUserId }: { user: AdminUser; currentUserId: string }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user.role);
  const [active, setActive] = useState(user.isActive);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function saveAccount(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const res = await sendJson(`/api/admin/users/${user.id}`, "PATCH", {
      name,
      ...(phone.trim() ? { phone } : {}),
      role,
      ...(password ? { password } : {}),
    });
    setBusy(false);
    setMessage(res.ok ? "Đã cập nhật tài khoản" : (res.data?.error ?? "Không thể cập nhật"));
    if (res.ok) {
      setPassword("");
      router.refresh();
    }
  }

  async function toggleActive() {
    setBusy(true);
    setMessage("");
    const next = !active;
    const res = await sendJson(`/api/admin/users/${user.id}`, "PATCH", { isActive: next });
    setBusy(false);
    if (!res.ok) {
      setMessage(res.data?.error ?? "Không thể cập nhật");
      return;
    }
    setActive(next);
    setMessage(next ? "Đã mở tài khoản" : "Đã khóa tài khoản");
  }

  async function deleteAccount() {
    if (!confirm(`Xóa tài khoản "${user.name}"? Dữ liệu học tập, dự án và bài nộp liên quan sẽ bị xóa; đơn đăng ký học thử được giữ lại.`)) {
      return;
    }
    setBusy(true);
    setMessage("");
    const res = await sendJson(`/api/admin/users/${user.id}`, "DELETE");
    setBusy(false);
    if (!res.ok) {
      setMessage(res.data?.error ?? "Không thể xóa tài khoản");
      return;
    }
    router.refresh();
  }

  return (
    <tr className="border-t border-ink/10 align-top">
      <td className="p-3 whitespace-nowrap">{formatDate(user.createdAt)}</td>
      <td className="p-3">
        <form onSubmit={saveAccount} className="flex min-w-[31rem] flex-col gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={60}
            aria-label={`Tên tài khoản ${user.phone ?? user.id}`}
            className="input !py-1.5 !text-base"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-label={`Số điện thoại của ${user.name}`}
            placeholder="09xx xxx xxx"
            className="input !py-1.5 !text-base"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AdminUser["role"])}
            aria-label={`Vai trò của ${user.name}`}
            className="input !py-1.5 !text-base"
          >
            <option value="USER">Học viên</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={100}
            autoComplete="new-password"
            aria-label={`Mật khẩu mới cho ${user.name}`}
            placeholder="Mật khẩu mới (để trống nếu giữ nguyên)"
            className="input !py-1.5 !text-base"
          />
          <button
            type="submit"
            disabled={busy || (name === user.name && phone === (user.phone ?? "") && role === user.role && !password)}
            className="btn-secondary btn-sm w-fit"
          >
            Lưu thay đổi
          </button>
        </form>
      </td>
      <td className="p-3 whitespace-nowrap">{user.stars} ⭐</td>
      <td className="p-3">
        <div className="flex min-w-36 flex-col items-start gap-2">
          <span className={`chip ${active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
            {active ? "Đang hoạt động" : "Đã khóa"}
          </span>
          <button
            type="button"
            onClick={toggleActive}
            disabled={busy || (user.id === currentUserId && active)}
            className={active ? "btn-ghost btn-sm" : "btn-primary btn-sm"}
          >
            {active ? "Khóa" : "Mở khóa"}
          </button>
          <button
            type="button"
            onClick={deleteAccount}
            disabled={busy || user.id === currentUserId}
            className="btn btn-sm rounded-xl bg-rose-50 px-4 py-2 text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xóa tài khoản
          </button>
        </div>
        {message && <p className="mt-1 text-sm text-ink/70" role="status">{message}</p>}
      </td>
    </tr>
  );
}

export function CreateAccountForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function createAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setBusy(true);
    setError("");
    setMessage("");
    const res = await sendJson("/api/admin/users", "POST", {
      name: formData.get("name"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      role: formData.get("role"),
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.data?.error ?? "Không thể tạo tài khoản");
      return;
    }
    form.reset();
    setMessage("Đã tạo tài khoản mới.");
    router.refresh();
  }

  return (
    <form onSubmit={createAccount} className="mb-5 grid gap-3 rounded-2xl bg-scratch-50 p-4 sm:grid-cols-2 xl:grid-cols-5">
      <input name="name" required minLength={2} maxLength={60} placeholder="Họ tên" className="input !py-2 !text-base" />
      <input name="phone" type="tel" required placeholder="Số điện thoại" className="input !py-2 !text-base" />
      <input name="password" type="password" required minLength={8} maxLength={100} placeholder="Mật khẩu (ít nhất 8 ký tự)" className="input !py-2 !text-base" />
      <select name="role" defaultValue="USER" className="input !py-2 !text-base">
        <option value="USER">Học viên</option>
        <option value="ADMIN">Quản trị viên</option>
      </select>
      <button type="submit" disabled={busy} className="btn-primary btn-sm">
        {busy ? "Đang tạo..." : "＋ Tạo tài khoản"}
      </button>
      {error && <p className="alert-error sm:col-span-2 xl:col-span-5" role="alert">{error}</p>}
      {message && <p className="alert-ok sm:col-span-2 xl:col-span-5" role="status">{message}</p>}
    </form>
  );
}
