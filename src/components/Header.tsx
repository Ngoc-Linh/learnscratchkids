import Link from "next/link";
import { getUser } from "@/lib/auth";
import { SITE } from "@/lib/site";
import LogoutButton from "./LogoutButton";
import ActiveNavLink from "./ActiveNavLink";

const NAV = [
  { href: "/khoa-hoc", label: "Khóa học" },
  { href: "/huong-dan-giai-de", label: "Hướng dẫn giải đề" },
  { href: "/san-pham", label: "Sản phẩm" },
];

export function Logo() {
  return (
    <span className="group/logo flex items-center gap-2.5 font-display text-2xl font-extrabold">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-500 text-xl text-white shadow-pop transition-transform duration-300 group-hover/logo:-rotate-6 group-hover/logo:scale-105">S</span>
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
    <Link href="/dang-nhap" className="btn-ghost btn-sm whitespace-nowrap rounded-full">
      Đăng nhập
    </Link>
  );

  return (
    <header className="site-header sticky top-0 z-40 border-b border-ink/5 bg-white/90 backdrop-blur-xl">
      <div className="container-page flex min-h-[76px] items-center justify-between gap-3 py-3">
        <Link href="/" aria-label={SITE.name}>
          <Logo />
        </Link>

        {/* Desktop */}
        <nav className="hidden min-w-0 items-center gap-1 xl:flex 2xl:gap-2">
          <div className="flex min-w-0 items-center gap-1">
            {NAV.map((n) => (
              <ActiveNavLink key={n.href} href={n.href} className="whitespace-nowrap rounded-full px-3 py-2 font-display text-base font-bold 2xl:px-4 2xl:text-lg">
                {n.label}
              </ActiveNavLink>
            ))}
          </div>
          <span className="mx-2 h-7 w-px shrink-0 bg-ink/10" />
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            {account}
          </div>
          <Link href="/dang-ky-hoc?hoc-thu=1" className="btn-primary btn-sm ml-1 shrink-0 whitespace-nowrap rounded-full px-4 text-base 2xl:text-lg">
            Đăng ký học thử
          </Link>
        </nav>

        {/* Mobile (không cần JS) */}
        <details className="group relative xl:hidden">
          <summary className="btn-ghost btn-sm cursor-pointer list-none whitespace-nowrap rounded-full text-lg">☰ Menu</summary>
          <div className="absolute right-0 mt-3 flex w-72 flex-col gap-3 rounded-3xl border border-ink/5 bg-white p-5 shadow-[0_20px_50px_-20px_rgba(30,42,74,0.35)]">
            {NAV.map((n) => (
              <ActiveNavLink key={n.href} href={n.href} className="whitespace-nowrap rounded-lg px-3 py-2 font-display text-lg font-bold">
                {n.label}
              </ActiveNavLink>
            ))}
            <hr className="border-ink/10" />
            <div className="flex flex-col gap-3">{account}</div>
            <Link href="/dang-ky-hoc?hoc-thu=1" className="btn-primary btn-sm whitespace-nowrap">
              Đăng ký học thử
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
