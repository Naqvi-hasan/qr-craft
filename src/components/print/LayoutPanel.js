"use client";

import { memo, useMemo } from "react";
import Icon from "../Icon";
import { NO_SIDE, getSize, layoutsFor, renderSide } from "@/lib/print/engine";
import { useDebounce } from "@/hooks/useDebounce";

// Thumbnails redraw a little after typing stops, so the form stays snappy.
const Thumb = memo(function Thumb({ svg, label, tag, active, hasQr, onClick }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`group flex flex-col gap-1.5 rounded-2xl border-2 p-1.5 text-left transition ${active ? "border-primary bg-primary-soft" : "border-transparent hover:border-line-strong"}`}
    >
      <span className="qr-canvas block overflow-hidden rounded-lg bg-surface-2 shadow-card" dangerouslySetInnerHTML={{ __html: svg }} />
      <span className="flex items-center gap-1.5 px-1 text-xs font-semibold text-text">
        {label}
        {hasQr && (
          <span className="rounded-full bg-success-soft px-1.5 py-px text-[10px] font-bold uppercase text-success" title="This layout has the QR">
            QR
          </span>
        )}
      </span>
      {tag && <span className="-mt-1 px-1 text-[11px] text-subtle">{tag}</span>}
    </button>
  );
});

function gridClass(size) {
  const [w, h] = size;
  if (w / h > 4) return "grid-cols-1";
  if (w / h > 1.2) return "grid-cols-2 xl:grid-cols-3";
  return "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4";
}

function SideLayouts({ product, side, state, values, qrValues, onChange }) {
  const list = useMemo(() => layoutsFor(product, side.id, state), [product, side.id, state.qrSide]); // eslint-disable-line react-hooks/exhaustive-deps
  const size = getSize(product, values);
  const thumbs = useMemo(
    () =>
      list.map((layout) => {
        const temp = { ...state, layouts: { ...state.layouts, [side.id]: layout.id } };
        try {
          return { layout, svg: renderSide(product, temp, side.id, values, qrValues)?.svg ?? "" };
        } catch {
          return { layout, svg: "" };
        }
      }),
    // The thumbnail of each layout doesn't depend on which layout is selected for this side.
    [list, product, side.id, state.accent, state.font, state.qrShape, state.lang, state.images, state.show, state.layouts.front, values, qrValues], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const current = state.layouts[side.id];

  return (
    <div className="flex flex-col gap-3">
      {product.sides.length > 1 && (
        <h3 className="flex items-center gap-2 text-sm font-semibold text-text">
          {side.label}
          <span className="font-normal text-subtle">· {list.length} layouts</span>
        </h3>
      )}
      <div role="radiogroup" aria-label={`${side.label} layout`} className={`grid gap-2 ${gridClass(size)}`}>
        {side.optional && !(product.qrPlacement && state.qrSide === side.id) && (
          <button
            type="button"
            role="radio"
            aria-checked={current === NO_SIDE}
            onClick={() => onChange((s) => ({ ...s, layouts: { ...s.layouts, [side.id]: NO_SIDE } }))}
            className={`flex min-h-[90px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed p-3 text-xs font-semibold transition ${
              current === NO_SIDE ? "border-primary bg-primary-soft text-primary-text" : "border-line-strong text-muted hover:text-text"
            }`}
          >
            <Icon name="x" size={18} />
            No {side.label.toLowerCase()}
            <span className="font-normal text-subtle">One-sided print</span>
          </button>
        )}
        {thumbs.map(({ layout, svg }) => (
          <Thumb
            key={layout.id}
            svg={svg}
            label={layout.name}
            tag={layout.tag}
            hasQr={product.qrPlacement && layout.hasQr}
            active={current === layout.id}
            onClick={() => onChange((s) => ({ ...s, layouts: { ...s.layouts, [side.id]: layout.id } }))}
          />
        ))}
      </div>
    </div>
  );
}

export default function LayoutPanel({ product, state, values, qrValues, onChange }) {
  // Thumbnails use slightly older values while typing.
  const fresh = useMemo(() => ({ pid: product.id, state, values, qrValues }), [product.id, state, values, qrValues]);
  const late = useDebounce(fresh, 300);
  const t = late.pid === product.id ? late : fresh;
  // Current layout choices show at once; only the drawing data lags behind.
  const thumbState = useMemo(() => ({ ...t.state, layouts: state.layouts, qrSide: state.qrSide }), [t.state, state.layouts, state.qrSide]);

  return (
    <div className="flex flex-col gap-6">
      {product.qrPlacement && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text">Where should the QR go?</span>
          <div role="radiogroup" aria-label="QR side" className="flex gap-1 rounded-xl border border-line bg-surface-2 p-1">
            {product.sides.map((side) => (
              <button
                key={side.id}
                type="button"
                role="radio"
                aria-checked={state.qrSide === side.id}
                onClick={() => onChange((s) => ({ ...s, qrSide: side.id }))}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  state.qrSide === side.id ? "bg-brand-gradient text-on-primary shadow-card" : "text-muted hover:bg-surface hover:text-text"
                }`}
              >
                <Icon name="qr" size={16} />
                QR on the {side.label.toLowerCase()}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted">
            {state.qrSide === "front" ? "Front layouts include the QR. The back is optional: logo, pattern, or none." : "The front shows your details. Pick a back with the QR."}
          </p>
        </div>
      )}
      {product.sides.map((side) => (
        <SideLayouts key={side.id} product={product} side={side} state={thumbState} values={t.values} qrValues={t.qrValues} onChange={onChange} />
      ))}
    </div>
  );
}
