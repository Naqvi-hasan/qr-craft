"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import LibraryCard from "./LibraryCard";
import { deleteDesign, listDesigns, putDesign, putMany } from "@/lib/library/db";
import { duplicateRecord, makeBackup, parseBackup, searchRecords, updateRecord } from "@/lib/library/model";

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

export default function LibraryApp() {
  const [records, setRecords] = useState(null); // null = loading
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [query, setQuery] = useState("");

  const reload = useCallback(() => {
    listDesigns()
      .then((all) => {
        setRecords(all);
        setError(null);
      })
      .catch((err) => {
        setRecords([]);
        setError(err.message);
      });
  }, []);

  useEffect(reload, [reload]);

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
      const { records: restored, skipped } = parseBackup(await file.text());
      await putMany(restored);
      setNotice(`Restored ${restored.length} design${restored.length === 1 ? "" : "s"}${skipped ? `, skipped ${skipped} that couldn't be read` : ""}.`);
      setError(null);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  const visible = records ? searchRecords(records, query) : [];

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
            disabled={!records?.length}
            onClick={() => downloadText(makeBackup(records), `qrcraft-library-${new Date().toISOString().slice(0, 10)}.json`)}
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

      {records === null ? (
        <p className="text-sm text-muted">Loading your designs…</p>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary-text">
            <Icon name="folder" size={26} />
          </span>
          <h2 className="text-lg font-semibold text-text">Save your first design</h2>
          <p className="max-w-sm text-sm text-muted">Make a QR code in the Studio and press "Save to library". It'll show up here so you can edit or download it again later.</p>
          <Link href="/" className="bg-brand-gradient mt-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-on-primary">
            Open the Studio
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted">No designs match "{query}".</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
          {visible.map((record) => (
            <LibraryCard
              key={record.id}
              record={record}
              onRename={(r, name) => act(() => putDesign(updateRecord(r, { name })))}
              onDuplicate={(r) => act(() => putDesign(duplicateRecord(r)), `Made a copy of "${r.name}".`)}
              onDelete={(r) => act(() => deleteDesign(r.id), `Deleted "${r.name}".`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
