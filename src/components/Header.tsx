import Link from "next/link";
import { getUser } from "@/lib/auth";
import { SITE } from "@/lib/site";
import LogoutButton from "./LogoutButton";
import ActiveNavLink from "./ActiveNavLink";

const NAV = [
  { href: "/khoa-hoc", label: "Khóa học" },
  { href: "/huong-dan-giai-de", label: "Hướng dẫn giải đề" },
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/blog", label: "Góc phụ huynh" },
];

export function Logo() {
  return (
    <span className="flex items-center gap-2 font-display text-2xl font-extrabold">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-white shadow-pop">S</span>
      <span>
        Scratch<span className="text-scratch-500">Kids</span>
      </span>
    </span>
  );
}

export default async function Header() {
  const user = await getUser();

  const account = user ? (
    <>
      <ActiveNavLink href="/tai-khoan" className="rounded-lg px-2 py-1 font-display font-bold">
        {user.name.split(" ").slice(-1)[0]} · ⭐ {user.stars}
      </ActiveNavLink>
      {user.role === "ADMIN" && (
        <ActiveNavLink href="/admin" className="rounded-lg px-2 py-1 font-display font-bold">
          Quản trị
        </ActiveNavLink>
      )}
      <LogoutButton />
    </>
  ) : (
    <>
      <ActiveNavLink href="/dang-nhap" className="rounded-lg px-2 py-1 font-display font-bold">
        Đăng nhập
      </ActiveNavLink>
      <ActiveNavLink href="/dang-ky" className="rounded-lg px-2 py-1 font-display font-bold">
        Tạo tài khoản
      </ActiveNavLink>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-white/90 backdrop-blur">
      <div className="container-page flex items-center justify-between gap-3 py-3">
        <Link href="/" aria-label={SITE.name}>
          <Logo />
        </Link>

        {/* Desktop */}
        <nav className="hidden min-w-0 items-center gap-3 xl:flex 2xl:gap-4">
          {NAV.map((n) => (
            <ActiveNavLink key={n.href} href={n.href} className="whitespace-nowrap rounded-lg px-2 py-2 font-display text-sm font-bold 2xl:text-base">
              {n.label}
            </ActiveNavLink>
          ))}
          <span className="h-6 w-px shrink-0 bg-ink/10" />
          <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">
            {account}
          </div>
          <Link href="/dang-ky-hoc?hoc-thu=1" className="btn-primary btn-sm shrink-0 whitespace-nowrap px-3 text-sm 2xl:px-4 2xl:text-base">
            Đăng ký học thử 0đ
          </Link>
        </nav>

        {/* Mobile (không cần JS) */}
        <details className="group relative xl:hidden">
          <summary className="btn-ghost btn-sm cursor-pointer list-none whitespace-nowrap">☰ Menu</summary>
          <div className="absolute right-0 mt-2 flex w-64 flex-col gap-3 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-ink/10">
            {NAV.map((n) => (
              <ActiveNavLink key={n.href} href={n.href} className="whitespace-nowrap rounded-lg px-3 py-2 font-display font-bold">
                {n.label}
              </ActiveNavLink>
            ))}
            <hr className="border-ink/10" />
            <div className="flex flex-col gap-3">{account}</div>
            <Link href="/dang-ky-hoc?hoc-thu=1" className="btn-primary btn-sm whitespace-nowrap">
              Đăng ký học thử 0đ
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
