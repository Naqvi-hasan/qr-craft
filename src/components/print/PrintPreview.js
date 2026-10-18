"use client";

import { useEffect, useState } from "react";
import Icon from "../Icon";
import { useScanCheck } from "@/hooks/useScanCheck";

const BADGES = {
  checking: ["loader", "Checking it scans…", "border-line text-muted"],
  pass: ["checkCircle", "Scan-tested", "border-success/30 bg-success-soft text-success"],
  fail: ["alert", "Might not scan: try a bigger QR layout or less text in it", "border-warning/30 bg-warning-soft text-warning"],
  error: ["alert", "Couldn't run the scan check", "border-line text-muted"],
};

export default function PrintPreview({ product, sides, rendered, size, isSample, onFill }) {
  const [view, setView] = useState(sides[0]?.id ?? "front");
  const [actual, setActual] = useState(false);
  useEffect(() => {
    if (!sides.some((s) => s.id === view)) setView(sides[0]?.id ?? "front");
  }, [sides, view]);

  const shown = rendered[view] ?? rendered[sides[0]?.id];
  const qrSideId = sides.find((s) => rendered[s.id]?.payload)?.id;
  const qrSide = qrSideId ? rendered[qrSideId] : null;
  const [w, h] = size;
  const checkWidth = qrSide?.qrBox ? (360 * w) / qrSide.qrBox.size : 720;
  const scan = useScanCheck({ svg: isSample ? null : qrSide?.svg, aspect: h / w, payload: qrSide?.payload, width: checkWidth });
  const badge = BADGES[scan];
  const wide = w / h > 1.25;

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-semibold text-text">
          <Icon name="eye" size={18} className="text-primary-text" />
          Preview
          <span className="text-xs font-normal text-subtle">{product.sizeLabel}</span>
        </h2>
        {sides.length > 1 && (
          <div role="tablist" aria-label="Side" className="flex gap-1 rounded-lg border border-line bg-surface-2 p-0.5">
            {sides.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={view === s.id}
                onClick={() => setView(s.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${view === s.id ? "bg-surface text-primary-text shadow-card" : "text-muted hover:text-text"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`grid place-items-center overflow-auto rounded-2xl border border-line bg-surface-2 ${actual ? "max-h-[70vh] p-3" : "p-4"}`}>
        {shown?.svg ? (
          <div
            role="img"
            aria-label={`${product.label} ${view} preview`}
            className={`qr-canvas shrink-0 overflow-hidden rounded-md shadow-card ${actual ? "" : wide ? "w-full" : "w-full max-w-[300px]"}`}
            style={actual ? { width: `${w}mm` } : undefined}
            dangerouslySetInnerHTML={{ __html: shown.svg }}
          />
        ) : (
          <p className="py-10 text-sm text-muted">Pick a layout to see it here.</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {isSample ? (
          <button type="button" onClick={onFill} className="flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning-soft px-3 py-1 text-xs font-semibold text-warning">
            <Icon name="edit" size={14} />
            Sample details. Add yours
          </button>
        ) : badge ? (
          <span role="status" className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badge[2]}`}>
            <Icon name={badge[0]} size={14} className={scan === "checking" ? "animate-spin" : ""} />
            {badge[1]}
            {qrSideId && qrSideId !== view ? ` (QR on the ${sides.find((s) => s.id === qrSideId)?.label.toLowerCase()})` : ""}
          </span>
        ) : (
          <span />
        )}
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted">
          <input type="checkbox" checked={actual} onChange={(e) => setActual(e.target.checked)} className="h-4 w-4 accent-primary" />
          Actual size (approx.)
        </label>
      </div>
    </section>
  );
}
