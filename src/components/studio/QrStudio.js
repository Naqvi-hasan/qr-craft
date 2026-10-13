"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import TypeTabs from "./TypeTabs";
import QrForm from "./QrForm";
import QrPreview from "./QrPreview";
import ExportPanel from "./ExportPanel";
import MobileQrBar from "./MobileQrBar";
import DesignPanel from "./design/DesignPanel";
import Icon from "../Icon";
import { QR_TYPES, getQrType, buildQr } from "@/qr-types";
import { CTA_BY_TYPE, DEFAULT_STYLE } from "@/config/qrStyle";
import { TEMPLATE_MAP } from "@/config/templates";
import { applyPreset, applyTheme, getEffectiveEcLevel, getStyleWarnings, setIn } from "@/lib/qr/style";
import { isDense } from "@/lib/capacity";
import { useDebounce } from "@/hooks/useDebounce";
import { useQrDesign } from "@/hooks/useQrDesign";
import { useScanCheck } from "@/hooks/useScanCheck";

function initialValuesForAllTypes() {
  return Object.fromEntries(QR_TYPES.map((t) => [t.id, { ...t.initialValues }]));
}

const cardClass = "rounded-3xl border border-line bg-surface shadow-card";

// The editor. Layout changes with screen size:
//   very wide (2xl): content | preview | design, all visible
//   laptop (lg):     [Content | Design tabs] | preview
//   phone:           tabs, then preview below (plus a floating "view QR" button)
export default function QrStudio({ typeId, onTypeChange, templateId, onTemplateApplied }) {
  const [valuesByType, setValuesByType] = useState(initialValuesForAllTypes);
  const [touchedByType, setTouchedByType] = useState({});
  const [style, setStyle] = useState(DEFAULT_STYLE);
  const [pane, setPane] = useState("content");
  const [showPayload, setShowPayload] = useState(false);

  const type = getQrType(typeId);
  const values = valuesByType[type.id];
  const touched = touchedByType[type.id] ?? {};
  const ecLevel = getEffectiveEcLevel(style);

  // Opened from the Templates page: apply that design once.
  useEffect(() => {
    const template = templateId && TEMPLATE_MAP[templateId];
    if (!template) return;
    setStyle((prev) => applyPreset(prev, template.style));
    setPane("design");
    onTemplateApplied?.();
  }, [templateId, onTemplateApplied]);

  const { errors, payload } = useMemo(() => buildQr(type.id, values, ecLevel), [type.id, values, ecLevel]);
  const debouncedPayload = useDebounce(payload, 250);
  const debouncedStyle = useDebounce(style, 120);
  // While a field is invalid, hide the QR straight away instead of showing an old one.
  const previewPayload = payload ? debouncedPayload : null;

  const design = useQrDesign(previewPayload, debouncedStyle);
  const scanStatus = useScanCheck({ svg: design.svg, aspect: design.aspect, payload: previewPayload });
  const warnings = useMemo(() => getStyleWarnings(style), [style]);

  function handleChange(name, value) {
    setValuesByType((prev) => ({ ...prev, [type.id]: { ...prev[type.id], [name]: value } }));
    if (value !== "" && value !== false) markTouched(name);
  }

  function markTouched(name) {
    setTouchedByType((prev) => (prev[type.id]?.[name] ? prev : { ...prev, [type.id]: { ...prev[type.id], [name]: true } }));
  }

  const setStyleValue = useCallback(
    (path, value) =>
      setStyle((prev) => {
        let next = setIn(prev, path, value);
        // Turning a frame on? Suggest a label that fits this QR type.
        if (path === "frame.style" && value !== "none" && prev.frame.style === "none" && prev.frame.text === DEFAULT_STYLE.frame.text) {
          next = setIn(next, "frame.text", CTA_BY_TYPE[type.id] ?? DEFAULT_STYLE.frame.text);
        }
        return next;
      }),
    [type.id]
  );

  const tabClass = (id) =>
    `flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
      pane === id ? "bg-brand-gradient text-on-primary shadow-card" : "text-muted hover:bg-surface-2 hover:text-text"
    }`;

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_360px_360px]">
      <div className="flex min-w-0 flex-col gap-4 lg:col-start-1 lg:row-start-1 2xl:contents">
        <div role="tablist" aria-label="Editor steps" className="flex gap-1 rounded-2xl border border-line bg-surface p-1 shadow-card 2xl:hidden">
          <button type="button" role="tab" aria-selected={pane === "content"} onClick={() => setPane("content")} className={tabClass("content")}>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-black/10 text-[11px]">1</span>
            Content
          </button>
          <button type="button" role="tab" aria-selected={pane === "design"} onClick={() => setPane("design")} className={tabClass("design")}>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-black/10 text-[11px]">2</span>
            Design
          </button>
        </div>

        <section
          aria-label="QR content"
          className={`${cardClass} min-w-0 flex-col gap-6 p-4 sm:p-6 ${pane === "content" ? "flex" : "hidden"} 2xl:col-start-1 2xl:row-start-1 2xl:flex`}
        >
          <TypeTabs types={QR_TYPES} activeId={type.id} onChange={onTypeChange} />
          <div className="h-px bg-line" />
          <QrForm type={type} values={values} errors={errors} touched={touched} onChange={handleChange} onBlur={markTouched} />
          <button
            type="button"
            onClick={() => setPane("design")}
            className="flex items-center justify-center gap-2 self-end rounded-xl border border-primary/40 px-4 py-2.5 text-sm font-semibold text-primary-text transition hover:bg-primary-soft 2xl:hidden"
          >
            Next: customize the design
            <Icon name="arrowRight" size={16} />
          </button>
        </section>

        <section
          aria-label="QR design"
          className={`${cardClass} min-w-0 flex-col p-4 sm:p-5 ${pane === "design" ? "flex" : "hidden"} 2xl:col-start-3 2xl:row-start-1 2xl:sticky 2xl:top-20 2xl:flex 2xl:max-h-[calc(100vh-6rem)] 2xl:overflow-y-auto scroll-thin`}
        >
          <div className="flex items-center justify-between pb-1">
            <h2 className="flex items-center gap-2 text-base font-semibold text-text">
              <Icon name="wand" size={18} className="text-primary-text" />
              Design
            </h2>
            <button type="button" onClick={() => setPane("content")} className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-text 2xl:hidden">
              <Icon name="arrowLeft" size={14} />
              Back to content
            </button>
          </div>
          <DesignPanel
            style={style}
            set={setStyleValue}
            onApplyTheme={(theme) => setStyle((prev) => applyTheme(prev, theme.style))}
            onReset={() => setStyle(DEFAULT_STYLE)}
          />
        </section>
      </div>

      <aside
        id="qr-preview"
        aria-label="QR code preview and download"
        className={`${cardClass} flex scroll-mt-36 flex-col gap-4 p-4 lg:scroll-mt-20 sm:p-5 lg:sticky lg:top-20 lg:col-start-2 lg:row-start-1`}
      >
        <h2 className="flex items-center gap-2 text-base font-semibold text-text">
          <Icon name="eye" size={18} className="text-primary-text" />
          Live preview
        </h2>

        <QrPreview svg={design.svg} type={type} scanStatus={scanStatus} transparent={debouncedStyle.background.transparent} error={design.error} />

        {(warnings.length > 0 || (payload && isDense(payload))) && (
          <ul className="flex flex-col gap-1.5">
            {warnings.map((w) => (
              <li key={w} className="flex gap-2 rounded-xl bg-warning-soft px-3 py-2 text-xs text-warning">
                <Icon name="alert" size={15} className="mt-px shrink-0" />
                {w}
              </li>
            ))}
            {payload && isDense(payload) && (
              <li className="flex gap-2 rounded-xl bg-warning-soft px-3 py-2 text-xs text-warning">
                <Icon name="alert" size={15} className="mt-px shrink-0" />
                Lots of data makes a dense QR. Print it at least 3 cm wide.
              </li>
            )}
          </ul>
        )}

        <ExportPanel svg={design.svg} aspect={design.aspect} fileName={`qr-${type.id}`} transparent={style.background.transparent} />

        {payload && (
          <div className="text-xs text-subtle">
            <button
              type="button"
              onClick={() => setShowPayload((s) => !s)}
              aria-expanded={showPayload}
              className="flex items-center gap-1 underline-offset-2 hover:text-text hover:underline"
            >
              <Icon name="chevron" size={14} className={`transition ${showPayload ? "rotate-180" : ""}`} />
              {showPayload ? "Hide" : "Show"} what's inside this QR
            </button>
            {showPayload && (
              <pre className="scroll-thin mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-line bg-surface-2 p-3 font-mono text-[11px] text-muted">
                {payload}
              </pre>
            )}
          </div>
        )}
      </aside>

      <MobileQrBar ready={Boolean(payload)} targetId="qr-preview" label={type.label} />
    </div>
  );
}
