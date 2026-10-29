// Gửi email qua Resend (https://resend.com). Nếu chưa cấu hình, chỉ ghi log và bỏ qua.

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendMail(opts: { to: string; subject: string; html: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from) {
    console.log(`[mail] bỏ qua (chưa cấu hình RESEND_API_KEY/MAIL_FROM): ${opts.subject} -> ${opts.to}`);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    if (!res.ok) console.error("[mail] Resend lỗi:", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("[mail] gửi thất bại:", e);
    return false;
  }
}
