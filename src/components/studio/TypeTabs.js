"use client";

import { useEffect, useRef } from "react";
import Icon from "../Icon";

// QR type tiles (URL, Phone, WiFi...). Built from the registry, so new types appear automatically.
// Phone: one row you can swipe sideways. Tablet and up: a wrapping grid.
export default function TypeTabs({ types, activeId, onChange }) {
  const listRef = useRef(null);

  // On phones, slide the selected tile into view (e.g. when picked from a shared #link).
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector('[aria-selected="true"]');
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: active.offsetLeft - list.clientWidth / 2 + active.clientWidth / 2, behavior: "smooth" });
  }, [activeId]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="QR code type"
      className="scroll-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(76px,1fr))] sm:overflow-visible sm:px-0 sm:pb-0"
    >
      {types.map((type) => {
        const active = type.id === activeId;
        return (
          <button
            key={type.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(type.id)}
            className={`flex w-[78px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border px-1.5 py-3 text-xs font-medium transition sm:w-auto ${
              active
                ? "bg-brand-gradient border-transparent text-on-primary shadow-card"
                : "border-line bg-surface text-muted hover:border-line-strong hover:bg-surface-2 hover:text-text"
            }`}
          >
            <Icon name={type.icon} size={20} />
            <span className="max-w-full truncate">{type.label}</span>
          </button>
        );
      })}
    </div>
  );
}
