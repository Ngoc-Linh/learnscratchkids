import Link from "next/link";
import { SITE } from "@/lib/site";
import { Logo } from "./Header";
import ActiveNavLink from "./ActiveNavLink";

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink text-white">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-3">
        <div>
          <div className="[&_span]:text-white">
            <Logo />
          </div>
          <p className="mt-3 text-base text-white/70">{SITE.slogan}</p>
        </div>
        <div>
          <h3 className="mb-3 text-lg">Khám phá</h3>
          <ul className="space-y-2 text-base text-white/80">
            <li><ActiveNavLink href="/khoa-hoc" className="rounded px-1" activeClassName="font-bold text-brand-400" inactiveClassName="hover:text-brand-400">Khóa học</ActiveNavLink></li>
            <li><ActiveNavLink href="/san-pham" className="rounded px-1" activeClassName="font-bold text-brand-400" inactiveClassName="hover:text-brand-400">Sản phẩm</ActiveNavLink></li>
            <li><ActiveNavLink href="/blog" className="rounded px-1" activeClassName="font-bold text-brand-400" inactiveClassName="hover:text-brand-400">Góc phụ huynh</ActiveNavLink></li>
            <li><Link href="/dang-ky-hoc?hoc-thu=1" className="hover:text-brand-400">Đăng ký học thử</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-lg">Liên hệ</h3>
          <ul className="space-y-2 text-base text-white/80">
            {SITE.email && <li>Email: {SITE.email}</li>}
            {SITE.zalo && <li>Zalo: {SITE.zalo}</li>}
            {!SITE.email && !SITE.zalo && <li>Gửi đăng ký học thử, chúng tôi sẽ liên hệ lại.</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm text-white/50">
        © {new Date().getFullYear()} {SITE.name}. Scratch là dự án của Scratch Foundation / MIT Media Lab; {SITE.name} không trực thuộc tổ chức này.
      </div>
    </footer>
  );
}
