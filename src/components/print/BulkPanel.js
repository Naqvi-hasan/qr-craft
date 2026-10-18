"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import { bulkItems, getSheet, renderItem, sheetLayout } from "@/lib/print/engine";
import { bulkRows, codesForRange } from "@/lib/print/bulk";
import { downloadBlob, downloadSheet, fileBase } from "@/lib/print/export";
import { defaultPrintName } from "@/lib/print/record";
import { useDebounce } from "@/hooks/useDebounce";

const input = "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-text outline-none transition placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/15";

export default function BulkPanel({ product, state, size }) {
  const cfg = product.bulk;
  const [bulk, setBulk] = useState({ text: "", start: state.values.number || "1", count: "50" });
  const [progress, setProgress] = useState(null);
  const [status, setStatus] = useState(null);
  const settled = useDebounce(bulk, 300);

  const { rows, error, truncated, ignored } = useMemo(() => bulkRows(product, settled), [product, settled]);
  const { items, problems } = useMemo(() => bulkItems(product, state.values, rows), [product, state.values, rows]);
  const sheet = getSheet(product, state.values);
  const perPage = sheet ? sheetLayout(size, sheet).slots.length : 1;
  const name = defaultPrintName(product, state.values);

  const codes = cfg.kind === "numbers" ? codesForRange(state.values.prefix, settled.start, Math.min(Number(settled.count) || 0, cfg.max), state.values.digits) : [];

  async function exportAll() {
    setStatus(null);
    setProgress({ done: 0, total: items.length });
    try {
      // Draw every item first (fast, just text), then let the PDF step rasterise them.
      const svgs = items.map((values) => {
        const r = renderItem(product, state, values, values);
        return Object.fromEntries(Object.entries(r).map(([side, out]) => [side, out?.svg]));
      });
      await downloadSheet({ items: svgs, size, sheet, name: `${name}-bulk`, onProgress: (done, total) => setProgress({ done, total }) });
      setStatus({ ok: true, text: `Done: ${items.length} in one PDF` });
    } catch (err) {
      console.error(err);
      setStatus({ ok: false, text: err?.message || "Couldn't create the PDF." });
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text">
          <Icon name="users" size={20} className="text-primary-text" />
          {cfg.title}
        </h2>
        <p className="mt-1 text-sm text-muted">{cfg.help}</p>
      </div>

      {cfg.kind === "numbers" && (
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2 text-sm font-semibold text-text">
            Start number
            <input className={input} inputMode="numeric" value={bulk.start} onChange={(e) => setBulk((b) => ({ ...b, start: e.target.value.replace(/\D/g, "").slice(0, 7) }))} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-text">
            How many (max {cfg.max})
            <input className={input} inputMode="numeric" value={bulk.count} onChange={(e) => setBulk((b) => ({ ...b, count: e.target.value.replace(/\D/g, "").slice(0, 4) }))} />
          </label>
          {codes.length > 0 && (
            <div className="col-span-2 flex flex-col gap-2 rounded-xl bg-surface-2 px-3.5 py-3 text-xs text-muted">
              <span>
                Ticket codes: <b className="font-mono text-text">{codes[0]}</b> to <b className="font-mono text-text">{codes[codes.length - 1]}</b>
              </span>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => downloadBlob(new Blob([codes.join("\n")], { type: "text/plain" }), `${fileBase(name)}-tickets.txt`)} className="rounded-lg border border-line bg-surface px-2.5 py-1.5 font-semibold text-text hover:border-line-strong">
                  Download ticket list
                </button>
                <Link href="/scanner#gate" className="flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 font-semibold text-primary-text hover:border-line-strong">
                  <Icon name="gate" size={14} />
                  Open Gate check
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {cfg.kind === "list" && (
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Names (one per line)
          <textarea className={`${input} min-h-[160px] resize-y font-normal`} placeholder={cfg.placeholder} value={bulk.text} onChange={(e) => setBulk((b) => ({ ...b, text: e.target.value }))} />
        </label>
      )}

      {cfg.kind === "csv" && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-text">Paste from Excel / Google Sheets, or upload a CSV</span>
            <div className="flex gap-2">
              <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-text hover:border-line-strong">
                <Icon name="upload" size={14} />
                Upload CSV
                <input
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  className="sr-only"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    if (file.size > 2_000_000) return setStatus({ ok: false, text: "That file is too big (max 2 MB)." });
                    const text = await file.text();
                    setBulk((b) => ({ ...b, text }));
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => downloadBlob(new Blob([cfg.sampleCsv], { type: "text/csv" }), `${product.id}-sample.csv`)}
                className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-text hover:border-line-strong"
              >
                <Icon name="download" size={14} />
                Sample CSV
              </button>
            </div>
          </div>
          <textarea
            className={`${input} min-h-[160px] resize-y font-mono text-xs`}
            placeholder={cfg.sampleCsv}
            value={bulk.text}
            onChange={(e) => setBulk((b) => ({ ...b, text: e.target.value.replace(/\t/g, ",") }))}
          />
          {ignored?.length > 0 && <p className="text-xs text-subtle">Ignored columns: {ignored.join(", ")}</p>}
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface-2 p-4">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="font-semibold text-text">{items.length} ready</span>
          {sheet && items.length > 0 && <span className="text-muted">· {Math.ceil(items.length / perPage)} A4 page{Math.ceil(items.length / perPage) > 1 ? "s" : ""}{product.sides.length > 1 ? " (+ backs)" : ""}</span>}
          {problems.length > 0 && <span className="text-warning">· {problems.length} need fixing</span>}
        </p>
        {error && rows.length === 0 && (bulk.text || cfg.kind === "numbers") && <p className="text-xs text-warning">{error}</p>}
        {truncated && <p className="text-xs text-warning">Only the first {cfg.max} are used.</p>}
        {problems.slice(0, 4).map((p) => (
          <p key={p.row} className="text-xs text-warning">
            Row {p.row}: {p.message}
          </p>
        ))}
        {problems.length > 0 && problems.length === rows.length && <p className="text-xs text-muted">Shared details (like the event name) come from the Details tab.</p>}
      </div>

      <button
        type="button"
        disabled={!items.length || Boolean(progress)}
        onClick={exportAll}
        className="bg-brand-gradient flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-on-primary shadow-card disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Icon name={progress ? "loader" : "printer"} size={18} className={progress ? "animate-spin" : ""} />
        {progress ? `Drawing ${progress.done} / ${progress.total}…` : `Download all ${items.length || ""} as one PDF`}
      </button>
      {progress && (
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuenow={progress.done} aria-valuemax={progress.total}>
          <div className="h-full bg-primary transition-all" style={{ width: `${(100 * progress.done) / Math.max(1, progress.total)}%` }} />
        </div>
      )}
      {status && <p className={`text-center text-xs font-medium ${status.ok ? "text-success" : "text-danger"}`}>{status.text}</p>}
    </div>
  );
}
