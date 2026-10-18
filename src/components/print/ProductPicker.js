"use client";

import Icon from "../Icon";

// Row of things you can print. Scrolls sideways on phones.
export default function ProductPicker({ products, value, onChange }) {
  return (
    <nav aria-label="What do you want to print?" className="scroll-thin -mx-1 overflow-x-auto px-1 pb-1">
      <div role="tablist" className="flex min-w-max gap-2 sm:grid sm:min-w-0 sm:grid-cols-5 xl:grid-cols-9">
        {products.map((p) => {
          const active = p.id === value;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(p.id)}
              title={p.description}
              className={`flex w-[104px] flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-xs font-semibold transition sm:w-auto ${
                active ? "bg-brand-gradient border-transparent text-on-primary shadow-card" : "border-line bg-surface text-muted hover:border-line-strong hover:text-text"
              }`}
            >
              <Icon name={p.icon} size={22} />
              <span className="text-center leading-tight">{p.short}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
