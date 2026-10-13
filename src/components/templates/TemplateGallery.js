"use client";

import { useState } from "react";
import TemplateCard from "./TemplateCard";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/config/templates";

export default function TemplateGallery() {
  const [category, setCategory] = useState("all");
  const visible = category === "all" ? TEMPLATES : TEMPLATES.filter((t) => t.category === category);

  return (
    <section aria-label="Template gallery" className="flex flex-col gap-5">
      <div role="tablist" aria-label="Template categories" className="scroll-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {TEMPLATE_CATEGORIES.map((c) => {
          const active = c.id === category;
          const count = c.id === "all" ? TEMPLATES.length : TEMPLATES.filter((t) => t.category === c.id).length;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(c.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                active ? "bg-brand-gradient border-transparent text-on-primary shadow-card" : "border-line bg-surface text-muted hover:border-line-strong hover:text-text"
              }`}
            >
              {c.label}
              <span className={`rounded-full px-1.5 text-[11px] ${active ? "bg-white/20" : "bg-surface-2"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
        {visible.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </section>
  );
}
