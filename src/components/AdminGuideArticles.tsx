"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GuideArticle, GuideArticleFields, GuideCategory } from "@/lib/guide-seed";
import { sendJson } from "@/lib/client";

type AdminGuideArticle = GuideArticle;

type ArticleForm = Omit<GuideArticleFields, "algorithm"> & {
  algorithm: string;
};

const emptyForm: ArticleForm = {
  category: "PRACTICE",
  title: "",
  summary: "",
  prompt: "",
  imageUrl: "",
  imageAlt: "",
  blockCode: "",
  algorithm: "",
  explanation: "",
  published: true,
};

export default function AdminGuideArticles({ articles }: { articles: AdminGuideArticle[] }) {
  const router = useRouter();
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function editArticle(article: AdminGuideArticle) {
    setEditingId(article.id);
    setForm({
      category: article.category,
      title: article.title,
      summary: article.summary,
      prompt: article.prompt,
      imageUrl: article.imageUrl,
      imageAlt: article.imageAlt,
      blockCode: article.blockCode,
      algorithm: article.algorithm.join("\n"),
      explanation: article.explanation,
      published: article.published,
    });
    setError("");
    setMessage("");
    document.getElementById("guide-article-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    setEditingId("");
    setForm(emptyForm);
    setError("");
    setMessage("");
  }

  async function saveArticle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const payload = {
      ...form,
      algorithm: form.algorithm.split(/\r?\n/).map((step) => step.trim()).filter(Boolean),
    };
    const result = await sendJson(
      editingId ? `/api/admin/guide-articles/${editingId}` : "/api/admin/guide-articles",
      editingId ? "PATCH" : "POST",
      payload,
    );
    setBusy(false);
    if (!result.ok) {
      setError(result.data?.error ?? "Không thể lưu bài viết.");
      return;
    }
    setMessage(editingId ? "Đã cập nhật bài hướng dẫn." : "Đã tạo bài hướng dẫn.");
    if (!editingId) setForm(emptyForm);
    setEditingId("");
    router.refresh();
  }

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setMessage("");
    const body = new FormData();
    body.set("image", file);
    try {
      const response = await fetch("/api/admin/guide-articles/image", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Không thể tải hình ảnh lên.");
        return;
      }
      setForm((current) => ({ ...current, imageUrl: result.imageUrl }));
      setMessage("Đã tải hình minh họa lên.");
    } catch {
      setError("Không kết nối được máy chủ để tải hình ảnh.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function deleteArticle(article: AdminGuideArticle) {
    if (!confirm(`Xóa bài "${article.title}"? Thao tác này không thể hoàn tác.`)) return;
    setError("");
    setMessage("");
    const result = await sendJson(`/api/admin/guide-articles/${article.id}`, "DELETE");
    if (!result.ok) {
      setError(result.data?.error ?? "Không thể xóa bài viết.");
      return;
    }
    if (editingId === article.id) resetForm();
    setMessage("Đã xóa bài hướng dẫn.");
    router.refresh();
  }

  function update<K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <form id="guide-article-editor" onSubmit={saveArticle} className="card scroll-mt-28 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl font-extrabold">{editingId ? "Chỉnh sửa bài viết" : "Đăng bài hướng dẫn mới"}</h3>
            <p className="mt-1 text-sm text-ink/60">Quản lý nội dung đề, lời giải, thuật toán và hình minh họa.</p>
          </div>
          {editingId && <button type="button" onClick={resetForm} className="btn-ghost btn-sm">＋ Bài mới / Hủy sửa</button>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-bold">
            Danh mục
            <select
              value={form.category}
              onChange={(event) => update("category", event.target.value as GuideCategory)}
              className="input !text-base"
            >
              <option value="PRACTICE">Luyện tập</option>
              <option value="EXAM">Đề thi</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-bold">
            Tiêu đề bài viết
            <input value={form.title} onChange={(event) => update("title", event.target.value)} required minLength={3} maxLength={120} className="input !text-base" />
          </label>
        </div>

        <label className="block space-y-1 text-sm font-bold">
          Mô tả ngắn
          <textarea value={form.summary} onChange={(event) => update("summary", event.target.value)} required minLength={10} maxLength={300} rows={2} className="input !text-base" />
        </label>
        <label className="block space-y-1 text-sm font-bold">
          Nội dung đề bài
          <textarea value={form.prompt} onChange={(event) => update("prompt", event.target.value)} required minLength={10} maxLength={5000} rows={4} className="input !text-base" />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-bold">
            Ảnh minh họa khối lệnh (PNG, JPEG, WebP · tối đa 5 MB)
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadImage} disabled={uploading} className="input !text-base" />
          </label>
          <label className="space-y-1 text-sm font-bold">
            Mô tả ảnh (alt text)
            <input value={form.imageAlt} onChange={(event) => update("imageAlt", event.target.value)} maxLength={200} className="input !text-base" />
          </label>
        </div>
        {uploading && <p className="text-sm font-semibold text-scratch-700" role="status">Đang tải ảnh lên...</p>}
        {form.imageUrl && (
          <div className="flex flex-wrap items-start gap-4 rounded-2xl bg-ink/5 p-3">
            <Image src={form.imageUrl} alt={form.imageAlt || "Ảnh minh họa đang chọn"} width={240} height={150} unoptimized className="max-h-40 w-auto rounded-xl object-contain" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-bold">Ảnh hiện tại</p>
              <p className="mt-1 break-all text-ink/60">{form.imageUrl}</p>
              <button type="button" onClick={() => update("imageUrl", "")} className="btn-ghost btn-sm mt-2">Gỡ ảnh</button>
            </div>
          </div>
        )}

        <label className="block space-y-1 text-sm font-bold">
          Mô tả khối lệnh Scratch (không bắt buộc)
          <textarea value={form.blockCode} onChange={(event) => update("blockCode", event.target.value)} maxLength={10000} rows={7} className="input !text-base font-mono" placeholder="Ghi tên nhân vật và các khối lệnh theo thứ tự..." />
        </label>
        <label className="block space-y-1 text-sm font-bold">
          Các bước thuật toán (mỗi dòng là một bước)
          <textarea value={form.algorithm} onChange={(event) => update("algorithm", event.target.value)} required rows={5} className="input !text-base" placeholder={"1. Khởi tạo biến...\n2. Xử lý sự kiện...\n3. Kiểm tra kết quả..."} />
        </label>
        <label className="block space-y-1 text-sm font-bold">
          Giải thích chi tiết
          <textarea value={form.explanation} onChange={(event) => update("explanation", event.target.value)} required minLength={10} maxLength={10000} rows={7} className="input !text-base" />
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={form.published} onChange={(event) => update("published", event.target.checked)} className="h-4 w-4 accent-scratch-600" />
          Công khai bài viết
        </label>

        {error && <p className="alert-error" role="alert">{error}</p>}
        {message && <p className="alert-ok" role="status">{message}</p>}
        <button type="submit" disabled={busy || uploading} className="btn-primary">
          {busy ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "＋ Đăng bài viết"}
        </button>
      </form>

      <div>
        <h3 className="mb-3 font-display text-2xl font-extrabold">Bài viết hiện có ({articles.length})</h3>
        {articles.length === 0 ? (
          <p className="card text-ink/60">Chưa có bài hướng dẫn nào.</p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {articles.map((article) => (
              <article key={article.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className="chip bg-scratch-100 text-scratch-800">{article.category === "PRACTICE" ? "Luyện tập" : "Đề thi"}</span>
                    <span className={`chip ${article.published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {article.published ? "Đang công khai" : "Bản nháp"}
                    </span>
                  </div>
                  <h4 className="font-display text-lg font-extrabold">{article.title}</h4>
                  <p className="mt-1 text-sm text-ink/60">{article.summary}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => editArticle(article)} className="btn-secondary btn-sm">Sửa</button>
                  <button type="button" onClick={() => deleteArticle(article)} className="btn btn-sm rounded-xl bg-rose-50 px-4 py-2 text-rose-700 hover:bg-rose-100">Xóa</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
