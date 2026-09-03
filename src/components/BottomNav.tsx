"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const TABS: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: "/inventario",
    label: "Inventário",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M4 10h16l-1.5 9a1.5 1.5 0 0 1-1.5 1.3H7A1.5 1.5 0 0 1 5.5 19z" />
        <path d="M8 10 9 4h6l1 6" />
        <path d="M10 14v3M14 14v3" />
      </svg>
    ),
  },
  {
    href: "/receitas",
    label: "Receitas",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M5 4.5C5 3.7 5.7 3 6.5 3H18a1 1 0 0 1 1 1v15.5a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 19z" />
        <path d="M8 3v17" />
        <path d="M11 7h6M11 10.5h6" />
      </svg>
    ),
  },
  {
    href: "/sugestoes",
    label: "Sugestões",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
        <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
      </svg>
    ),
  },
  {
    href: "/plano",
    label: "Plano",
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="3.5" y="5" width="17" height="16" rx="2.3" />
        <path d="M3.5 9.5h17" />
        <path d="M8 3v4M16 3v4" />
        <path d="M8 13.5h2M14 13.5h2M8 17h2M14 17h2" />
      </svg>
    ),
  },
  {
    href: "/compras",
    label: "Compras",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M3 4h2l2.2 12.2A1.8 1.8 0 0 0 9 17.8h8.5a1.8 1.8 0 0 0 1.75-1.4L21 8H6" />
        <circle cx="9.5" cy="21" r="1.3" />
        <circle cx="17" cy="21" r="1.3" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-[480px] border-t border-line bg-surface"
      style={{ paddingBottom: "env(safe-area-inset-bottom,0px)" }}
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-1 px-0.5 pb-2 pt-2.5 text-[10.5px] font-bold ${
              active ? "text-primary" : "text-ink-soft"
            }`}
          >
            <span className="h-[22px] w-[22px] [&>svg]:h-full [&>svg]:w-full">
              {tab.icon}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
