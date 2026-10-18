import Link from "next/link";
import Icon from "../Icon";
import { SEO_PAGES } from "@/config/seo";

const BADGES = [
  { icon: "checkCircle", text: "No sign-up required" },
  { icon: "checkCircle", text: "100% free" },
  { icon: "lock", text: "Data stays in your browser" },
  { icon: "device", text: "Works on all devices" },
];

const TOOLS = [
  { href: "/templates", label: "Templates" },
  { href: "/cards", label: "Print studio" },
  { href: "/scanner", label: "QR scanner" },
  { href: "/library", label: "My library" },
  { href: "/privacy", label: "Privacy" },
];

export default function Footer() {
  return (
    <footer className="mt-4 flex flex-col gap-6 border-t border-line pt-6 pb-2 text-xs text-muted">
      <div className="grid gap-6 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <nav aria-label="QR code generators">
          <p className="mb-2 font-semibold uppercase tracking-wider text-subtle">QR code generators</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {SEO_PAGES.map((p) => (
              <li key={p.slug}>
                <Link href={`/${p.slug}`} className="hover:text-text hover:underline">
                  {p.name} QR code
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Tools">
          <p className="mb-2 font-semibold uppercase tracking-wider text-subtle">Tools</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {TOOLS.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="hover:text-text hover:underline">
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {BADGES.map((b) => (
            <li key={b.text} className="flex items-center gap-1.5">
              <Icon name={b.icon} size={15} className="text-success" />
              {b.text}
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-1">
          Made with <Icon name="heart" size={14} className="text-danger" /> for a simpler web
        </p>
      </div>
    </footer>
  );
}
