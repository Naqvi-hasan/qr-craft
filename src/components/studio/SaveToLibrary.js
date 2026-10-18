"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import { putDesign, getDesign } from "@/lib/library/db";
import { createRecord, defaultName, updateRecord } from "@/lib/library/model";

// "Save to My Library" box under the download buttons.
// New design: name + Save. Opened from the library: Update, or Save as a new copy.
export default function SaveToLibrary({ canSave, saved, onSaved, buildRecord }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState(null); // { ok: boolean, text }
  const [busy, setBusy] = useState(false);

  async function run(action) {
    setBusy(true);
    setStatus(null);
    try {
      const record = await action();
      onSaved({ id: record.id, name: record.name });
      setStatus({ ok: true, text: `Saved as "${record.name}"` });
      setOpen(false);
      setTimeout(() => setStatus(null), 2500);
    } catch (err) {
      setStatus({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  }

  function saveNew(customName) {
    const data = buildRecord();
    return run(() => putDesign(createRecord({ ...data, name: customName || defaultName(data.typeLabel) })));
  }

  function update() {
    const data = buildRecord();
    return run(async () => {
      const existing = await getDesign(saved.id);
      if (!existing) return putDesign(createRecord({ ...data, name: saved.name }));
      return putDesign(updateRecord(existing, { typeId: data.typeId, values: data.values, style: data.style, payload: data.payload }));
    });
  }

  const buttonClass =
    "flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm font-semibold text-text transition hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-text">
          <Icon name="folder" size={16} className="text-primary-text" />
          My library
        </span>
        <Link href="/library" className="text-xs font-medium text-primary-text hover:underline">
          View all
        </Link>
      </div>

      {saved && <p className="truncate text-xs text-muted">Editing: {saved.name}</p>}

      {open ? (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            saveNew(name);
          }}
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder={defaultName(buildRecord().typeLabel)}
            aria-label="Design name"
            className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-2.5 py-2 text-sm text-text outline-none placeholder:text-subtle focus:border-primary"
          />
          <button type="submit" disabled={busy} className="rounded-lg bg-primary px-3 text-sm font-semibold text-on-primary disabled:opacity-50">
            Save
          </button>
          <button type="button" onClick={() => setOpen(false)} aria-label="Cancel" className="rounded-lg px-2 text-subtle hover:text-text">
            <Icon name="x" size={16} />
          </button>
        </form>
      ) : (
        <div className="flex gap-2">
          {saved ? (
            <>
              <button type="button" disabled={!canSave || busy} onClick={update} className={buttonClass}>
                <Icon name="check" size={16} />
                Update
              </button>
              <button type="button" disabled={!canSave || busy} onClick={() => setOpen(true)} className={buttonClass}>
                <Icon name="copy" size={16} />
                Save as new
              </button>
            </>
          ) : (
            <button type="button" disabled={!canSave || busy} onClick={() => setOpen(true)} className={buttonClass}>
              <Icon name="folder" size={16} />
              Save to library
            </button>
          )}
        </div>
      )}

      {status && (
        <p role="status" className={`text-xs font-medium ${status.ok ? "text-success" : "text-danger"}`}>
          {status.text}
        </p>
      )}
    </div>
  );
}
