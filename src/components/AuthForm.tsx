"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "@/lib/client";

export default function AuthForm({ mode, next = "/tai-khoan" }: { mode: "login" | "register"; next?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const body = isLogin
      ? { phone: f.get("phone"), password: f.get("password") }
      : { name: f.get("name"), phone: f.get("phone"), password: f.get("password") };
    const res = await sendJson(isLogin ? "/api/auth/login" : "/api/auth/register", "POST", body);
    setBusy(false);
    if (!res.ok) {
      setError(res.data?.error ?? "Có lỗi xảy ra");
      return;
    }
    router.push(next.startsWith("/") ? next : "/tai-khoan");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto w-full max-w-md space-y-4">
      <h1 className="text-3xl">{isLogin ? "Đăng nhập" : "Tạo tài khoản"}</h1>
      {!isLogin && (
        <div>
          <label htmlFor="name" className="label">Họ tên (phụ huynh hoặc học viên)</label>
          <input id="name" name="name" className="input" required minLength={2} maxLength={60} autoComplete="name" />
        </div>
      )}
      <div>
        <label htmlFor="phone" className="label">Số điện thoại</label>
        <input id="phone" name="phone" type="tel" className="input" required autoComplete="tel" inputMode="tel" placeholder="09xx xxx xxx" />
      </div>
      <div>
        <label htmlFor="password" className="label">Mật khẩu {isLogin ? "" : "(tối thiểu 8 ký tự)"}</label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          required
          minLength={isLogin ? 1 : 8}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
      </div>
      {error && <p className="alert-error" role="alert">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Tạo tài khoản"}
      </button>
      <p className="text-center text-base">
        {isLogin ? (
          <>Chưa có tài khoản? <Link href="/dang-ky" className="font-bold text-scratch-600">Tạo tài khoản</Link></>
        ) : (
          <>Đã có tài khoản? <Link href="/dang-nhap" className="font-bold text-scratch-600">Đăng nhập</Link></>
        )}
      </p>
    </form>
  );
}
