"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import LibraryCard from "./LibraryCard";
import PrintCard from "./PrintCard";
import { deleteDesign, deletePrint, listDesigns, listPrints, putDesign, putMany, putManyPrints, putPrint } from "@/lib/library/db";
import { duplicateRecord, makeBackup, parseBackup, searchRecords, updateRecord } from "@/lib/library/model";
import { duplicatePrintRecord, sanitizePrintRecord, updatePrintRecord } from "@/lib/print/record";
import { PRODUCT_MAP } from "@/lib/print/products";

function downloadText(text, fileName) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function searchPrints(list, query) {
  const q = String(query || "").trim().toLowerCase();
  const sorted = [...list].sort((a, b) => b.updatedAt - a.updatedAt);
  if (!q) return sorted;
  return sorted.filter((r) => r.name.toLowerCase().includes(q) || (PRODUCT_MAP[r.productId]?.label ?? "").toLowerCase().includes(q));
}

const TABS = [
  { id: "qr", label: "QR codes", icon: "qr" },
  { id: "prints", label: "Print designs", icon: "printer" },
];

export default function LibraryApp() {
  const [records, setRecords] = useState(null); // null = loading
  const [prints, setPrints] = useState(null);
  const [tab, setTab] = useState("qr");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [query, setQuery] = useState("");

  const reload = useCallback(() => {
    Promise.all([listDesigns(), listPrints()])
      .then(([designs, printList]) => {
        setRecords(designs);
        setPrints(printList.filter((r) => PRODUCT_MAP[r.productId]));
        setError(null);
      })
      .catch((err) => {
        setRecords([]);
        setPrints([]);
        setError(err.message);
      });
  }, []);

  useEffect(() => {
    if (window.location.hash === "#prints") setTab("prints");
    reload();
  }, [reload]);

  async function act(action, message) {
    try {
      await action();
      if (message) setNotice(message);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  async function restore(file) {
    try {
      if (file.size > 30 * 1024 * 1024) throw new Error("That backup file is too large.");
      const { records: restored, skipped, prints: rawPrints } = parseBackup(await file.text());
      const cleanPrints = rawPrints.map(sanitizePrintRecord).filter(Boolean);
      await putMany(restored);
      if (cleanPrints.length) await putManyPrints(cleanPrints);
      const total = restored.length + cleanPrints.length;
      const skippedAll = skipped + (rawPrints.length - cleanPrints.length);
      setNotice(`Restored ${total} design${total === 1 ? "" : "s"}${skippedAll ? `, skipped ${skippedAll} that couldn't be read` : ""}.`);
      setError(null);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  function selectTab(id) {
    setTab(id);
    window.history.replaceState(null, "", `${window.location.pathname}${id === "prints" ? "#prints" : ""}`);
  }

  const loading = records === null || prints === null;
  const total = (records?.length ?? 0) + (prints?.length ?? 0);
  const visibleQr = records ? searchRecords(records, query) : [];
  const visiblePrints = prints ? searchPrints(prints, query) : [];
  const list = tab === "qr" ? records ?? [] : prints ?? [];
  const visible = tab === "qr" ? visibleQr : visiblePrints;

  return (
    <section aria-label="My library" className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-4 shadow-card sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your designs"
            aria-label="Search your designs"
            className="w-full rounded-xl border border-line bg-surface-2 py-2.5 pl-9 pr-3 text-sm text-text outline-none placeholder:text-subtle focus:border-primary"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!total}
            onClick={() => downloadText(makeBackup(records ?? [], prints ?? []), `qrcraft-library-${new Date().toISOString().slice(0, 10)}.json`)}
            className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm font-medium text-muted transition hover:border-line-strong hover:text-text disabled:opacity-50"
          >
            <Icon name="download" size={16} />
            Back up
          </button>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm font-medium text-muted transition hover:border-line-strong hover:text-text">
            <Icon name="upload" size={16} />
            Restore
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) restore(file);
              }}
            />
          </label>
        </div>
      </div>

      <div role="tablist" aria-label="Kind of design" className="flex w-fit gap-1 rounded-xl border border-line bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => selectTab(t.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === t.id ? "bg-brand-gradient text-on-primary" : "text-muted hover:text-text"}`}
          >
            <Icon name={t.icon} size={16} />
            {t.label}
            <span className={`rounded-full px-1.5 text-xs ${tab === t.id ? "bg-white/20" : "bg-surface-2"}`}>{(t.id === "qr" ? records : prints)?.length ?? 0}</span>
          </button>
        ))}
      </div>

      <p className="flex items-start gap-2 text-xs text-muted">
        <Icon name="lock" size={14} className="mt-px shrink-0 text-subtle" />
        Designs are saved only in this browser on this device. Use Back up to move them to another device or keep a copy.
      </p>

      {error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
          {notice}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading your designs…</p>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary-text">
            <Icon name={tab === "qr" ? "folder" : "printer"} size={26} />
          </span>
          <h2 className="text-lg font-semibold text-text">{tab === "qr" ? "Save your first QR design" : "Save your first print design"}</h2>
          <p className="max-w-sm text-sm text-muted">
            {tab === "qr"
              ? 'Make a QR code in the Studio and press "Save to library". It shows up here so you can edit or download it again later.'
              : 'Make a card, wristband or invitation in the Print Studio and press "Save design".'}
          </p>
          <Link href={tab === "qr" ? "/" : "/cards"} className="bg-brand-gradient mt-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-on-primary">
            {tab === "qr" ? "Open the Studio" : "Open the Print Studio"}
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted">No designs match "{query}".</p>
      ) : tab === "qr" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
          {visibleQr.map((record) => (
            <LibraryCard
              key={record.id}
              record={record}
              onRename={(r, name) => act(() => putDesign(updateRecord(r, { name })))}
              onDuplicate={(r) => act(() => putDesign(duplicateRecord(r)), `Made a copy of "${r.name}".`)}
              onDelete={(r) => act(() => deleteDesign(r.id), `Deleted "${r.name}".`)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
          {visiblePrints.map((record) => (
            <PrintCard
              key={record.id}
              record={record}
              onRename={(r, name) => act(() => putPrint(updatePrintRecord(r, { name })))}
              onDuplicate={(r) => act(() => putPrint(duplicatePrintRecord(r)), `Made a copy of "${r.name}".`)}
              onDelete={(r) => act(() => deletePrint(r.id), `Deleted "${r.name}".`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
