"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "../Icon";
import { NAV_ITEMS } from "./nav";

// Left navigation (laptop and up).
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r border-line bg-surface lg:flex">
      <nav aria-label="Main" className="scroll-thin flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-subtle">Workspace</p>
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = item.href === pathname;
            const base = "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition";
            if (item.soon) {
              return (
                <li key={item.label}>
                  <span className={`${base} cursor-default text-subtle`} aria-disabled="true">
                    <Icon name={item.icon} size={18} />
                    {item.label}
                    <span className="ml-auto rounded-full border border-line px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">Soon</span>
                  </span>
                </li>
              );
            }
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`${base} ${active ? "bg-primary-soft text-primary-text dark:bg-brand-gradient dark:text-on-primary" : "text-muted hover:bg-surface-2 hover:text-text"}`}
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="m-3 flex gap-3 rounded-2xl border border-line bg-surface-2 p-4">
        <span className="bg-brand-gradient grid h-9 w-9 shrink-0 place-items-center rounded-lg text-on-primary">
          <Icon name="scan" size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-text">Create. Scan. Share.</p>
          <p className="mt-0.5 text-xs text-muted">Test-scan every QR with your phone before printing.</p>
        </div>
      </div>
    </aside>
  );
}
