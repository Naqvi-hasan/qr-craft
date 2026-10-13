"use client";

import { useState } from "react";
import Icon from "../../Icon";

// Small building blocks shared by every design section.

export function Section({ title, icon, children, defaultOpen = false, badge }) {
  return (
    <details open={defaultOpen} className="group border-b border-line last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-1 py-3.5 text-sm font-semibold text-text transition hover:text-primary-text">
        <Icon name={icon} size={18} className="text-primary-text" />
        {title}
        {badge && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-text">{badge}</span>}
        <Icon name="chevron" size={16} className="ml-auto text-subtle transition group-open:rotate-180" />
      </summary>
      <div className="flex flex-col gap-4 px-1 pb-5">{children}</div>
    </details>
  );
}

export function FieldLabel({ children, hint }) {
  return (
    <span className="flex items-baseline justify-between gap-2 text-xs font-semibold text-muted">
      {children}
      {hint && <span className="font-normal text-subtle">{hint}</span>}
    </span>
  );
}

const FULL_HEX = /^#[0-9a-f]{6}$/i;

export function ColorInput({ label, value, onChange }) {
  // `draft` lets the user type freely; the QR only updates once the hex code is complete.
  const [draft, setDraft] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }

  function handleText(e) {
    const next = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
    if (!/^#[0-9a-f]{0,6}$/i.test(next)) return;
    setDraft(next);
    if (FULL_HEX.test(next)) onChange(next.toLowerCase());
  }

  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <span className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-2 py-1.5 transition focus-within:border-primary">
        <input
          type="color"
          value={FULL_HEX.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} colour picker`}
          className="h-7 w-7 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <input
          type="text"
          value={draft}
          onChange={handleText}
          onBlur={() => setDraft(value)}
          className="w-full min-w-0 bg-transparent font-mono text-xs uppercase text-text outline-none"
          maxLength={7}
          aria-label={`${label} hex code`}
        />
      </span>
    </label>
  );
}

export function OptionPills({ label, options, value, onChange, disabled = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <FieldLabel>{label}</FieldLabel>}
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                active ? "bg-brand-gradient border-transparent text-on-primary" : "border-line bg-surface-2 text-muted hover:border-line-strong hover:text-text"
              }`}
            >
              {opt.icon && <Icon name={opt.icon} size={14} />}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Grid of square tiles with a drawn preview, e.g. dot shapes or eye shapes.
export function ShapePicker({ label, options, value, onChange, renderPreview, viewBox = "0 0 10 10" }) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-[repeat(auto-fill,minmax(58px,1fr))] gap-1.5">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={opt.label}
              title={opt.label}
              onClick={() => onChange(opt.value)}
              className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[11px] font-medium transition ${
                active ? "border-primary bg-primary-soft text-primary-text ring-2 ring-primary/25" : "border-line bg-surface-2 text-muted hover:border-line-strong hover:text-text"
              }`}
            >
              <svg viewBox={viewBox} className="h-8 w-8" aria-hidden="true">
                <path d={renderPreview(opt.value)} fill="currentColor" fillRule="evenodd" />
              </svg>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Slider({ label, value, min, max, step = 1, onChange, format = (v) => v, disabled = false }) {
  return (
    <label className={`flex flex-col gap-1.5 ${disabled ? "opacity-50" : ""}`}>
      <FieldLabel hint={format(value)}>{label}</FieldLabel>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-primary"
      />
    </label>
  );
}

export function Toggle({ label, checked, onChange, hint }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <span className="flex flex-col">
        <span className="text-sm text-text">{label}</span>
        {hint && <span className="text-xs text-subtle">{hint}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full bg-line-strong transition peer-checked:bg-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/25" />
        <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}

// Reads an image file into a data URL after checking type and size.
export function readImageFile(file, maxBytes) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file selected."));
    if (!/^image\/(png|jpe?g|gif|webp|svg\+xml)$/.test(file.type)) return reject(new Error("Choose a PNG, JPG, WebP, GIF or SVG image."));
    if (file.size > maxBytes) return reject(new Error(`Image must be under ${Math.round(maxBytes / 1024)} KB.`));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
}

export function ImageDrop({ label, onFile, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface-2 px-3 py-4 text-xs font-medium text-muted transition hover:border-primary hover:text-primary-text">
        <Icon name="upload" size={16} />
        {label}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onFile(file);
          }}
          className="sr-only"
        />
      </label>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
