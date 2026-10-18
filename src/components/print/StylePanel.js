"use client";

import { useState } from "react";
import Icon from "../Icon";
import { ColorInput, FieldLabel, OptionPills } from "../studio/design/controls";
import { FONT_OPTIONS } from "@/lib/print/fonts";
import { QR_DOT_OPTIONS } from "@/lib/print/qrBlock";
import { findLayout } from "@/lib/print/engine";
import { shrinkImage } from "@/lib/print/image";

function ImageSlot({ label, hint, value, onChange, round }) {
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="flex items-center gap-3">
        <span className={`grid h-14 w-14 shrink-0 place-items-center overflow-hidden border border-line bg-surface-2 text-subtle ${round ? "rounded-full" : "rounded-xl"}`}>
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <Icon name="image" size={20} />}
        </span>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line-strong px-3 py-2 text-xs font-semibold text-muted transition hover:border-primary hover:text-primary-text">
          <Icon name="upload" size={15} />
          {busy ? "Reading…" : value ? "Change" : "Upload"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setError(null);
              setBusy(true);
              try {
                onChange(await shrinkImage(file, round ? 600 : 800));
              } catch (err) {
                setError(err.message);
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-danger hover:bg-danger-soft">
            Remove
          </button>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export default function StylePanel({ product, state, onChange }) {
  const front = findLayout(product, product.sides[0].id, state.layouts[product.sides[0].id]);
  const layoutAccent = front?.accent ?? product.accent;
  const layoutFont = front?.font ?? "modern";
  const accent = state.accent ?? layoutAccent;
  const swatches = [...new Set([layoutAccent, ...(product.accents ?? [])])];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <FieldLabel hint={state.accent ? "Custom" : "Layout colour"}>Colour</FieldLabel>
        <div role="radiogroup" aria-label="Colour" className="flex flex-wrap items-center gap-2">
          {swatches.map((c) => {
            const active = accent.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={c === layoutAccent ? `Layout colour ${c}` : `Colour ${c}`}
                onClick={() => onChange((s) => ({ ...s, accent: c === layoutAccent ? null : c }))}
                className={`h-9 w-9 rounded-full border-2 transition ${active ? "border-text ring-2 ring-primary/30" : "border-line-strong"}`}
                style={{ background: c }}
              />
            );
          })}
        </div>
        <div className="max-w-[220px]">
          <ColorInput label="Any colour" value={accent} onChange={(c) => onChange((s) => ({ ...s, accent: c }))} />
        </div>
        <p className="text-xs text-muted">Text and QR colours adjust themselves so everything stays readable and scannable.</p>
      </div>

      <OptionPills
        label="Heading font"
        options={FONT_OPTIONS.map((f) => ({ ...f, label: f.value === layoutFont ? `${f.label} (layout)` : f.label }))}
        value={state.font ?? layoutFont}
        onChange={(f) => onChange((s) => ({ ...s, font: f === layoutFont ? null : f }))}
      />

      <OptionPills label="QR dots" options={QR_DOT_OPTIONS} value={state.qrShape} onChange={(q) => onChange((s) => ({ ...s, qrShape: q }))} />

      {product.lang && (
        <OptionPills
          label="Card language"
          options={[
            { value: "en", label: "English" },
            { value: "hi", label: "हिंदी" },
          ]}
          value={state.lang}
          onChange={(l) => onChange((s) => ({ ...s, lang: l }))}
        />
      )}

      {product.images?.logo && (
        <ImageSlot label="Logo" hint="Shown instead of the initials badge" value={state.images?.logo} onChange={(src) => onChange((s) => ({ ...s, images: { ...s.images, logo: src } }))} />
      )}
      {product.images?.photo && (
        <ImageSlot label="Photo" hint="Profile & badge layouts" round value={state.images?.photo} onChange={(src) => onChange((s) => ({ ...s, images: { ...s.images, photo: src } }))} />
      )}

      <button
        type="button"
        onClick={() => onChange((s) => ({ ...s, accent: null, font: null, qrShape: "rounded" }))}
        className="flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-muted hover:bg-surface-2 hover:text-text"
      >
        <Icon name="refresh" size={14} />
        Reset to the layout's style
      </button>
    </div>
  );
}
