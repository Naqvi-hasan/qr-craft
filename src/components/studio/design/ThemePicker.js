"use client";

import Link from "next/link";
import Icon from "../../Icon";
import { THEMES } from "@/config/themes";

// One-click looks. Each tile shows the theme's two main colours.
export default function ThemePicker({ onApply }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => onApply(theme)}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-surface-2 p-2.5 text-xs font-medium text-muted transition hover:border-primary hover:text-text"
          >
            <span className="relative h-9 w-9 overflow-hidden rounded-lg border border-line bg-white" aria-hidden="true">
              <span className="absolute left-1 top-1 h-3 w-3 rounded-[3px]" style={{ background: theme.swatch[0] }} />
              <span className="absolute right-1 top-1 h-3 w-3 rounded-[3px]" style={{ background: theme.swatch[0] }} />
              <span className="absolute bottom-1 left-1 h-3 w-3 rounded-[3px]" style={{ background: theme.swatch[0] }} />
              <span className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full" style={{ background: theme.swatch[1] }} />
            </span>
            {theme.name}
          </button>
        ))}
      </div>
      <Link href="/templates" className="flex items-center gap-1.5 self-start text-xs font-semibold text-primary-text hover:underline">
        <Icon name="sparkles" size={14} />
        Browse ready-made templates
      </Link>
    </div>
  );
}
