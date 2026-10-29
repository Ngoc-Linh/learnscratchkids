"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
};

export default function ActiveNavLink({
  href,
  children,
  className = "",
  activeClassName = "bg-scratch-50 text-scratch-700 ring-1 ring-scratch-200",
  inactiveClassName = "text-ink hover:text-scratch-700",
}: Props) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`transition-colors duration-200 ${className} ${active ? activeClassName : inactiveClassName}`}
    >
      {children}
    </Link>
  );
}
