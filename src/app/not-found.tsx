import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <div className="text-7xl">🧩</div>
      <h1 className="mt-4 text-4xl">Không tìm thấy trang</h1>
      <p className="mt-2 text-xl text-ink/70">Có thể đường link đã đổi hoặc không còn tồn tại.</p>
      <Link href="/" className="btn-primary mt-6">Về trang chủ</Link>
    </div>
  );
}
