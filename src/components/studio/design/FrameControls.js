"use client";

import { ColorInput, FieldLabel } from "./controls";
import { CTA_SUGGESTIONS, FRAME_OPTIONS } from "@/config/qrStyle";

// Tiny drawings of each frame style for the picker.
function FrameIcon({ type }) {
  const square = { none: [2, 4], bottom: [3, 3], top: [3, 7], pill: [2, 1] }[type];
  const filledFrame = type === "bottom" || type === "top";
  return (
    <svg viewBox="0 0 24 28" className="h-8 w-7" aria-hidden="true">
      {filledFrame && <rect x="1" y="1" width="22" height="26" rx="3" fill="currentColor" />}
      <rect x={square[0]} y={square[1]} width={filledFrame ? 18 : 20} height={filledFrame ? 18 : 20} rx="2" fill="var(--surface)" stroke="currentColor" strokeWidth={filledFrame ? 0 : 1.2} />
      {type === "pill" && <rect x="5" y="23" width="14" height="4.5" rx="2.25" fill="currentColor" />}
      {type !== "none" && <rect x="8.5" y={{ bottom: 23, top: 3, pill: 24.5 }[type]} width="7" height="1.6" rx="0.8" fill="var(--surface)" />}
    </svg>
  );
}

export default function FrameControls({ style, set }) {
  const { frame } = style;
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Frame style</FieldLabel>
        <div role="radiogroup" aria-label="Frame style" className="grid grid-cols-4 gap-1.5">
          {FRAME_OPTIONS.map((opt) => {
            const active = frame.style === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => set("frame.style", opt.value)}
                className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[11px] font-medium transition ${
                  active ? "border-primary bg-primary-soft text-primary-text ring-2 ring-primary/25" : "border-line bg-surface-2 text-muted hover:border-line-strong hover:text-text"
                }`}
              >
                <FrameIcon type={opt.value} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {frame.style !== "none" && (
        <>
          <label className="flex flex-col gap-1.5">
            <FieldLabel hint={`${frame.text.length}/28`}>Label text</FieldLabel>
            <input
              type="text"
              value={frame.text}
              maxLength={28}
              onChange={(e) => set("frame.text", e.target.value)}
              placeholder="Scan me"
              className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-text outline-none transition focus:border-primary"
            />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CTA_SUGGESTIONS.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => set("frame.text", text)}
                className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                  frame.text === text ? "border-primary bg-primary-soft text-primary-text" : "border-line text-muted hover:border-line-strong hover:text-text"
                }`}
              >
                {text}
              </button>
            ))}
          </div>
          <ColorInput label="Frame colour" value={frame.color} onChange={(v) => set("frame.color", v)} />
        </>
      )}
    </>
  );
}
