"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import { getSheet, sheetLayout } from "@/lib/print/engine";
import { canShareFiles, downloadPdf, downloadPng, downloadSheet, downloadTent, fileBase, makeEInvite, shareOrDownload } from "@/lib/print/export";
import { createPrintRecord, defaultPrintName, updatePrintRecord } from "@/lib/print/record";
import { getPrint, putPrint } from "@/lib/library/db";
import { makeTheme } from "@/lib/print/theme";
import { findLayout } from "@/lib/print/engine";

const secondary =
  "flex items-center justify-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm font-semibold text-text transition hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-50";

export default function PrintExport({ product, state, sides, rendered, size, isValid, saved, onSaved, onFill }) {
  const [busy, setBusy] = useState(null);
  const [status, setStatus] = useState(null); // { key } | { error } | { text }
  const name = defaultPrintName(product, state.values);
  const sheet = getSheet(product, state.values);
  const perSheet = sheet ? sheetLayout(size, sheet).slots.length : 0;
  const svgs = Object.fromEntries(sides.map((s) => [s.id, rendered[s.id]?.svg]).filter(([, svg]) => svg));
  const pages = sides.map((s) => svgs[s.id]).filter(Boolean);
  const hasBack = Boolean(svgs.back);
  const disabled = !isValid || !pages.length || Boolean(busy);

  async function run(key, action, done = "Downloaded") {
    setBusy(key);
    setStatus(null);
    try {
      const text = await action();
      setStatus({ key, text: typeof text === "string" ? text : done });
      setTimeout(() => setStatus((s) => (s?.key === key ? null : s)), 2600);
    } catch (err) {
      console.error(err);
      setStatus({ error: err?.message || "Couldn't create the file. Try again." });
    } finally {
      setBusy(null);
    }
  }

  const label = (key, text) => (busy === key ? "Working…" : status?.key === key ? status.text : text);

  async function save(asNew) {
    await run(
      "save",
      async () => {
        let record;
        const existing = saved && !asNew ? await getPrint(saved.id) : null;
        record = existing ? updatePrintRecord(existing, { state }) : createPrintRecord({ name, product, state });
        await putPrint(record);
        onSaved({ id: record.id, name: record.name });
        return existing ? "Updated" : "Saved";
      },
      "Saved",
    );
  }

  const front = findLayout(product, product.sides[0].id, state.layouts[product.sides[0].id]);
  const theme = makeTheme(state.accent ?? front?.accent ?? product.accent);

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-4 shadow-card sm:p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-text">
        <Icon name="printer" size={18} className="text-primary-text" />
        Download & print
      </h2>

      {!isValid && (
        <button type="button" onClick={onFill} className="flex items-start gap-2 rounded-xl bg-warning-soft px-3 py-2.5 text-left text-xs font-medium text-warning">
          <Icon name="edit" size={15} className="mt-px shrink-0" />
          Fill in your details first. The preview shows sample text until then.
        </button>
      )}

      {sheet ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => run("sheet", () => downloadSheet({ items: [svgs], size, sheet, name }))}
          className="bg-brand-gradient flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-on-primary shadow-card disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name={status?.key === "sheet" ? "check" : "printer"} size={18} />
          {label("sheet", `A4 print sheet: ${perSheet} ${perSheet === 1 ? "copy" : "copies"}${hasBack ? " + backs" : ""}`)}
        </button>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => run("pdf", () => downloadPdf({ pages, size, name }))}
          className={sheet ? secondary : "bg-brand-gradient col-span-2 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-on-primary shadow-card disabled:cursor-not-allowed disabled:opacity-40"}
        >
          <Icon name={status?.key === "pdf" ? "check" : "file"} size={16} />
          {label("pdf", hasBack ? "PDF (front + back)" : "PDF, true size")}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            run("png", async () => {
              for (const s of sides) if (svgs[s.id]) await downloadPng({ svg: svgs[s.id], size, name: hasBack ? `${name}-${s.id}` : name });
            })
          }
          className={secondary}
        >
          <Icon name={status?.key === "png" ? "check" : "image"} size={16} />
          {label("png", hasBack ? "PNG images" : "PNG image")}
        </button>
        <button type="button" disabled={disabled} onClick={() => run("shop", () => downloadPdf({ pages, size, name, printShop: true }))} className={secondary} title="3 mm bleed and crop marks, the way print shops want it">
          <Icon name={status?.key === "shop" ? "check" : "ruler"} size={16} />
          {label("shop", "Print-shop PDF")}
        </button>
        {product.tent && (
          <button type="button" disabled={disabled} onClick={() => run("tent", () => downloadTent({ svg: svgs.front, size, name }))} className={secondary} title="Fold-in-half stand for tables, 2 per A4">
            <Icon name={status?.key === "tent" ? "check" : "tent"} size={16} />
            {label("tent", "Table tent")}
          </button>
        )}
        {product.einvite && (
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              run("einvite", async () => {
                const blob = await makeEInvite({ svg: svgs.front, size, background: theme.deep });
                const result = await shareOrDownload(blob, `${fileBase(name)}-whatsapp.jpg`, name);
                return result === "shared" ? "Shared" : result === "cancelled" ? "Cancelled" : "Downloaded";
              })
            }
            className={`${secondary} col-span-2`}
          >
            <Icon name={status?.key === "einvite" ? "check" : "whatsapp"} size={16} />
            {label("einvite", canShareFiles() ? "Share on WhatsApp (image)" : "WhatsApp image (1080 × 1920)")}
          </button>
        )}
      </div>

      {status?.error && (
        <p role="alert" className="text-center text-xs text-danger">
          {status.error}
        </p>
      )}

      <div className="flex flex-col gap-2 rounded-xl border border-line p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-text">
            <Icon name="folder" size={16} className="text-primary-text" />
            My library
          </span>
          <Link href="/library#prints" className="text-xs font-medium text-primary-text hover:underline">
            View all
          </Link>
        </div>
        {saved && <p className="truncate text-xs text-muted">Editing: {saved.name}</p>}
        <div className="flex gap-2">
          <button type="button" disabled={Boolean(busy)} onClick={() => save(false)} className={`${secondary} flex-1`}>
            <Icon name={status?.key === "save" ? "check" : "download"} size={15} />
            {label("save", saved ? "Update" : "Save design")}
          </button>
          {saved && (
            <button type="button" disabled={Boolean(busy)} onClick={() => save(true)} className={`${secondary} flex-1`}>
              <Icon name="copy" size={15} />
              Save as copy
            </button>
          )}
        </div>
      </div>

      <ul className="flex flex-col gap-1.5 text-xs text-muted">
        <li className="flex gap-1.5">
          <Icon name="info" size={14} className="mt-px shrink-0 text-subtle" />
          Print at 100% (“Actual size”, not “Fit to page”) on thick paper. Files are 300 DPI.
        </li>
        {hasBack && (
          <li className="flex gap-1.5">
            <Icon name="refresh" size={14} className="mt-px shrink-0 text-subtle" />
            Double-sided: print page 1, put the paper back in, print page 2 (flip on the long edge). Backs are already mirrored to line up.
          </li>
        )}
        <li className="flex gap-1.5">
          <Icon name="scan" size={14} className="mt-px shrink-0 text-subtle" />
          Test-scan one printed copy with 2 phones before printing many.
        </li>
      </ul>
    </section>
  );
}
