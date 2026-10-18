"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "../Icon";
import QrForm from "../studio/QrForm";
import { Toggle } from "../studio/design/controls";
import ProductPicker from "./ProductPicker";
import LayoutPanel from "./LayoutPanel";
import StylePanel from "./StylePanel";
import BulkPanel from "./BulkPanel";
import PrintPreview from "./PrintPreview";
import PrintExport from "./PrintExport";
import { PRODUCTS, PRODUCT_MAP, getProduct } from "@/lib/print/products";
import { activeSides, defaultState, getSize, normalizeState, previewValues, renderItem } from "@/lib/print/engine";
import { sanitizeState } from "@/lib/print/record";
import { getPrint } from "@/lib/library/db";
import { useDebounce } from "@/hooks/useDebounce";

const DRAFT_KEY = "qrcraft-print-draft-v1";

function readDraft() {
  try {
    const raw = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (!raw || typeof raw !== "object") return null;
    const states = {};
    for (const [id, st] of Object.entries(raw.states ?? {})) if (PRODUCT_MAP[id]) states[id] = sanitizeState(PRODUCT_MAP[id], st);
    return { productId: PRODUCT_MAP[raw.productId] ? raw.productId : null, states };
  } catch {
    return null;
  }
}

function writeDraft(productId, states) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ productId, states }));
  } catch {
    // Storage full or blocked: the draft just isn't kept.
  }
}

const TABS = [
  { id: "layout", label: "Layout", icon: "layout" },
  { id: "details", label: "Details", icon: "edit" },
  { id: "style", label: "Style", icon: "palette" },
  { id: "bulk", label: "Bulk", icon: "users" },
];

export default function PrintStudio() {
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const [states, setStates] = useState({});
  const [tab, setTab] = useState("layout");
  const [touched, setTouched] = useState({});
  const [saved, setSaved] = useState(null); // { id, name } when editing a library design
  const [notice, setNotice] = useState(null);
  const ready = useRef(false);

  // Load: library design (?design=id) > product in the hash (#wifi) > last draft.
  useEffect(() => {
    const draft = readDraft();
    const hashId = window.location.hash.replace("#", "");
    const designId = new URLSearchParams(window.location.search).get("design");
    if (draft) setStates(draft.states);
    if (PRODUCT_MAP[hashId]) setProductId(hashId);
    else if (draft?.productId) setProductId(draft.productId);
    if (designId) {
      getPrint(designId)
        .then((record) => {
          if (!record || !PRODUCT_MAP[record.productId]) throw new Error("That saved design wasn't found in this browser.");
          const product = PRODUCT_MAP[record.productId];
          setProductId(product.id);
          setStates((prev) => ({ ...prev, [product.id]: sanitizeState(product, record.state) }));
          setSaved({ id: record.id, name: record.name });
          window.history.replaceState(null, "", `${window.location.pathname}#${product.id}`);
        })
        .catch((err) => setNotice(err.message));
    }
    ready.current = true;
    const onHash = () => {
      const id = window.location.hash.replace("#", "");
      if (PRODUCT_MAP[id]) setProductId(id);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const product = getProduct(productId);
  const state = useMemo(() => states[productId] ?? defaultState(product), [states, productId, product]);

  // Keep a draft per product in this browser.
  const draftStates = useDebounce(states, 600);
  useEffect(() => {
    if (ready.current && Object.keys(draftStates).length) writeDraft(productId, draftStates);
  }, [draftStates, productId]);

  const update = useCallback(
    (changes) => {
      setStates((prev) => {
        const current = prev[productId] ?? defaultState(PRODUCT_MAP[productId]);
        const next = typeof changes === "function" ? changes(current) : { ...current, ...changes };
        return { ...prev, [productId]: normalizeState(PRODUCT_MAP[productId], next) };
      });
    },
    [productId],
  );

  function selectProduct(id) {
    setProductId(id);
    setTouched({});
    setSaved(null);
    if (tab === "bulk" && !PRODUCT_MAP[id].bulk) setTab("layout");
    window.history.replaceState(null, "", `${window.location.pathname}#${id}`);
  }

  const setValue = (name, value) => {
    update((s) => ({ ...s, values: { ...s.values, [name]: value } }));
    if (value !== "" && value !== false) setTouched((t) => ({ ...t, [name]: true }));
  };

  // Rendering: values settle for a moment before the (heavier) drawing runs.
  const debouncedState = useDebounce(state, 120);
  // Right after switching product the debounced state still belongs to the old one.
  const renderState = debouncedState.productId === product.id ? debouncedState : state;
  const pv = useMemo(() => previewValues(product, renderState.values, renderState.layouts[product.sides[0].id]), [product, renderState]);
  const errors = useMemo(() => product.validate(state.values), [product, state.values]);
  const rendered = useMemo(() => {
    try {
      return renderItem(product, renderState, pv.values, pv.qrValues);
    } catch (err) {
      console.error(err);
      return {};
    }
  }, [product, renderState, pv]);

  const sides = activeSides(product, state);
  const size = getSize(product, pv.values);
  const isValid = Object.keys(errors).length === 0;
  const tabs = TABS.filter((t) => t.id !== "bulk" || (product.bulk && (!product.bulk.showIf || product.bulk.showIf(state.values))));

  const exportPanel = (
    <PrintExport
      product={product}
      state={state}
      sides={sides}
      rendered={rendered}
      size={size}
      isValid={isValid && !pv.isSample}
      saved={saved}
      onSaved={setSaved}
      onFill={() => setTab("details")}
    />
  );

  return (
    <div className="flex flex-col gap-5">
      <ProductPicker products={PRODUCTS} value={productId} onChange={selectProduct} />

      {notice && (
        <p role="alert" className="rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
          {notice}
        </p>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
        <section aria-label={`${product.label} editor`} className="order-2 flex min-w-0 flex-col rounded-3xl border border-line bg-surface shadow-card lg:order-1">
          <div role="tablist" aria-label="Editor sections" className="scroll-thin flex gap-1 overflow-x-auto border-b border-line p-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  tab === t.id ? "bg-primary-soft text-primary-text" : "text-muted hover:bg-surface-2 hover:text-text"
                }`}
              >
                <Icon name={t.icon} size={16} />
                {t.label}
                {t.id === "details" && !isValid && <span className="h-2 w-2 rounded-full bg-warning" aria-label="needs details" />}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {tab === "layout" && <LayoutPanel product={product} state={state} values={pv.values} qrValues={pv.qrValues} onChange={update} />}

            {tab === "details" && (
              <div className="flex flex-col gap-6">
                <p className="-mb-2 text-sm text-muted">{product.description}</p>
                <QrForm
                  type={{ label: product.label, icon: product.icon, fields: product.fields }}
                  title="Your details"
                  values={state.values}
                  errors={errors}
                  touched={touched}
                  onChange={setValue}
                  onBlur={(name) => setTouched((t) => ({ ...t, [name]: true }))}
                />
                {product.showOptions && (
                  <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2 p-4">
                    <p className="text-sm font-semibold text-text">Print on the card</p>
                    <p className="-mt-2 text-xs text-muted">Hidden details still go into the QR.</p>
                    {product.showOptions.map((o) => (
                      <Toggle key={o.key} label={o.label} checked={state.show?.[o.key] !== false} onChange={(on) => update((s) => ({ ...s, show: { ...s.show, [o.key]: on } }))} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "style" && <StylePanel product={product} state={state} onChange={update} />}

            {tab === "bulk" && product.bulk && <BulkPanel product={product} state={state} size={size} />}
          </div>
        </section>

        <aside aria-label="Preview and download" className="scroll-thin order-1 flex flex-col gap-4 lg:sticky lg:top-20 lg:order-2 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <PrintPreview product={product} sides={sides} rendered={rendered} size={size} isSample={pv.isSample} onFill={() => setTab("details")} />
          {/* Laptop: downloads sit under the preview. Phone: they come after the editor (below). */}
          <div className="hidden lg:block">{exportPanel}</div>
        </aside>
        <div className="order-3 lg:hidden">{exportPanel}</div>
      </div>
    </div>
  );
}
