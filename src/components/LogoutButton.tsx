"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "@/lib/client";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await sendJson("/api/auth/logout", "POST");
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={logout} disabled={busy} className="text-left font-display font-bold text-ink/60 hover:text-rose-600">
      Đăng xuất
    </button>
  );
}
