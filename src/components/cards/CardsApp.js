"use client";

import { useMemo, useState } from "react";
import Icon from "../Icon";
import QrForm from "../studio/QrForm";
import { CARD_ACCENTS, CARD_TYPES, CARD_TYPE_MAP, safeAccent, sheetLayout } from "@/lib/cards/cards";
import { downloadCardPdf, downloadCardPng, downloadCardSheet } from "@/lib/cards/export";
import { createMatrix } from "@/lib/qr/matrix";
import { renderQrSvg } from "@/lib/qr/render";
import { deepMerge } from "@/lib/qr/style";
import { deriveArtColors } from "@/lib/color";
import { DEFAULT_STYLE } from "@/config/qrStyle";
import { useDebounce } from "@/hooks/useDebounce";
import { useScanCheck } from "@/hooks/useScanCheck";

const DOT_OPTIONS = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Fluid" },
  { value: "dots", label: "Dots" },
];

const cardClass = "rounded-3xl border border-line bg-surface shadow-card";

// QR style for print: dark version of the accent colour, compact quiet zone, Quartile error correction.
function cardQrStyle(accent, shape) {
  const { dark } = deriveArtColors(accent);
  return deepMerge(DEFAULT_STYLE, {
    dots: { shape, color: dark },
    eyes: { outer: shape === "square" ? "square" : "rounded", inner: shape === "dots" ? "circle" : shape === "square" ? "square" : "rounded", matchDots: true },
    background: { rounded: false },
    quietZone: 2,
  });
}

export default function CardsApp() {
  const [cardId, setCardId] = useState("wifi");
  const [valuesByCard, setValuesByCard] = useState(() => Object.fromEntries(CARD_TYPES.map((c) => [c.id, { ...c.initialValues }])));
  const [touchedByCard, setTouchedByCard] = useState({});
  const [accent, setAccent] = useState(CARD_ACCENTS[0]);
  const [shape, setShape] = useState("rounded");
  const [status, setStatus] = useState(null); // { key } | { error }
  const [busy, setBusy] = useState(false);

  const card = CARD_TYPE_MAP[cardId];
  const values = valuesByCard[cardId];
  const touched = touchedByCard[cardId] ?? {};
  const errors = useMemo(() => card.validate(values), [card, values]);
  const payload = Object.keys(errors).length ? null : card.buildPayload(values);
  const debouncedValues = useDebounce(values, 200);
  const debouncedPayload = useDebounce(payload, 200);
  const shownPayload = payload ? debouncedPayload : null;

  const svg = useMemo(() => {
    if (!shownPayload) return null;
    try {
      const matrix = createMatrix(shownPayload, "Q");
      const qr = renderQrSvg({ matrix, style: cardQrStyle(safeAccent(accent), shape), width: 512 }).svg;
      return card.render({ values: debouncedValues, qrSvg: qr, accent: safeAccent(accent) });
    } catch {
      return null;
    }
  }, [shownPayload, debouncedValues, accent, shape, card]);

  const aspect = card.sizeMm[1] / card.sizeMm[0];
  const scanStatus = useScanCheck({ svg, aspect, payload: shownPayload });
  const perSheet = sheetLayout(card).slots.length;

  function handleChange(name, value) {
    setValuesByCard((prev) => ({ ...prev, [cardId]: { ...prev[cardId], [name]: value } }));
    if (value !== "" && value !== false) markTouched(name);
  }
  function markTouched(name) {
    setTouchedByCard((prev) => ({ ...prev, [cardId]: { ...prev[cardId], [name]: true } }));
  }

  async function run(key, action) {
    setBusy(true);
    setStatus(null);
    try {
      await action();
      setStatus({ key });
      setTimeout(() => setStatus(null), 2200);
    } catch (err) {
      setStatus({ error: err?.message || "Couldn't create the file. Try again." });
    } finally {
      setBusy(false);
    }
  }

  const name = values.place || values.shop || [values.firstName, values.lastName].filter(Boolean).join(" ") || card.label;
  const exportButton = "flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-text transition hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-50";

  const scanBadge = {
    checking: ["loader", "Checking it scans…", "border-line text-muted"],
    pass: ["checkCircle", "Scan-tested", "border-success/30 bg-success-soft text-success"],
    fail: ["alert", "Might not scan", "border-warning/30 bg-warning-soft text-warning"],
  }[scanStatus];

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <section aria-label="Card details" className={`${cardClass} flex min-w-0 flex-col gap-6 p-4 sm:p-6`}>
        <div role="tablist" aria-label="Card type" className="grid grid-cols-3 gap-2">
          {CARD_TYPES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={c.id === cardId}
              onClick={() => setCardId(c.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition ${
                c.id === cardId ? "bg-brand-gradient border-transparent text-on-primary shadow-card" : "border-line bg-surface text-muted hover:border-line-strong hover:text-text"
              }`}
            >
              <Icon name={c.icon} size={20} />
              {c.label}
            </button>
          ))}
        </div>
        <p className="-mt-2 text-sm text-muted">
          {card.description} <span className="text-subtle">Size: {card.sizeLabel}.</span>
        </p>
        <div className="h-px bg-line" />
        <QrForm type={card} values={values} errors={errors} touched={touched} onChange={handleChange} onBlur={markTouched} />
      </section>

      <aside aria-label="Card preview and download" className={`${cardClass} flex flex-col gap-4 p-4 sm:p-5 lg:sticky lg:top-20`}>
        <h2 className="flex items-center gap-2 text-base font-semibold text-text">
          <Icon name="eye" size={18} className="text-primary-text" />
          Print preview
        </h2>

        <div className="grid place-items-center rounded-2xl border border-line bg-surface-2 p-4">
          {svg ? (
            <div
              role="img"
              aria-label={`${card.label} preview`}
              className={`qr-canvas w-full overflow-hidden rounded-lg shadow-card ${card.sizeMm[0] > card.sizeMm[1] ? "max-w-[360px]" : "max-w-[260px]"}`}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <div className="flex aspect-[105/148] w-full max-w-[220px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong bg-surface px-4 text-center text-xs text-muted">
              <Icon name="card" size={26} />
              Fill in the details to see your card.
            </div>
          )}
          {svg && scanBadge && (
            <span role="status" className={`mt-3 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${scanBadge[2]}`}>
              <Icon name={scanBadge[0]} size={14} className={scanStatus === "checking" ? "animate-spin" : ""} />
              {scanBadge[1]}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted">Colour</span>
          <div role="radiogroup" aria-label="Card colour" className="flex flex-wrap gap-2">
            {CARD_ACCENTS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={accent === c}
                aria-label={`Colour ${c}`}
                onClick={() => setAccent(c)}
                className={`h-8 w-8 rounded-full border-2 transition ${accent === c ? "border-text ring-2 ring-primary/30" : "border-line-strong"}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted">QR dots</span>
          <div role="radiogroup" aria-label="QR dot style" className="flex gap-1.5">
            {DOT_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={shape === o.value}
                onClick={() => setShape(o.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  shape === o.value ? "bg-brand-gradient border-transparent text-on-primary" : "border-line bg-surface-2 text-muted hover:text-text"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={!svg || busy}
          onClick={() => run("sheet", () => downloadCardSheet({ svg, card, name }))}
          className="bg-brand-gradient flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-on-primary shadow-card disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name={status?.key === "sheet" ? "check" : "printer"} size={18} />
          {status?.key === "sheet" ? "Downloaded" : `Print sheet: ${perSheet} on A4 (PDF)`}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled={!svg || busy} onClick={() => run("pdf", () => downloadCardPdf({ svg, card, name }))} className={exportButton}>
            <Icon name={status?.key === "pdf" ? "check" : "file"} size={16} />
            {status?.key === "pdf" ? "Done" : "Single PDF"}
          </button>
          <button type="button" disabled={!svg || busy} onClick={() => run("png", () => downloadCardPng({ svg, card, name }))} className={exportButton}>
            <Icon name={status?.key === "png" ? "check" : "image"} size={16} />
            {status?.key === "png" ? "Done" : "PNG image"}
          </button>
        </div>
        {status?.error && (
          <p role="alert" className="text-center text-xs text-danger">
            {status.error}
          </p>
        )}
        <p className="flex items-start gap-1.5 text-xs text-muted">
          <Icon name="info" size={14} className="mt-px shrink-0 text-subtle" />
          Print at 100% size ("Actual size", not "Fit to page") on thick paper. 300 DPI, print-shop ready.
        </p>
      </aside>
    </div>
  );
}
