"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import HelpDialog from "./HelpDialog";
import ThemeToggle from "./ThemeToggle";
import Icon from "../Icon";
import { NAV_ITEMS } from "./nav";

export default function Header() {
  const pathname = usePathname();
  const links = NAV_ITEMS.filter((item) => !item.soon);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Link href="/" aria-label="QR Craft home" className="rounded-xl">
          <Logo />
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <HelpDialog />
          <ThemeToggle />
          <span className="hidden items-center gap-1.5 rounded-full border border-success/25 bg-success-soft px-3 py-1.5 text-xs font-semibold text-success md:flex">
            <Icon name="shield" size={15} />
            No sign-up required
          </span>
        </div>
      </div>

      {/* Phone/tablet navigation (the sidebar takes over on laptops). */}
      <nav aria-label="Main" className="flex gap-1 border-t border-line px-4 py-2 lg:hidden">
        {links.map((item) => {
          const active = item.href === pathname;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                active ? "bg-primary-soft text-primary-text" : "text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
