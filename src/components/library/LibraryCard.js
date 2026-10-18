"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import { getQrType } from "@/qr-types";
import { useQrDesign } from "@/hooks/useQrDesign";
import { exportQr } from "@/lib/qr/export";
import { designLink } from "@/lib/studioLink";

const iconButton = "grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:border-line-strong hover:text-text";

export default function LibraryCard({ record, onRename, onDuplicate, onDelete }) {
  const { svg, aspect } = useQrDesign(record.payload, record.style, 320);
  const type = getQrType(record.typeId);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(record.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState(null);

  async function download() {
    try {
      setError(null);
      await exportQr({ svg, aspect, format: "png", size: 1024, fileName: record.name });
    } catch (err) {
      setError(err.message);
    }
  }

  const updated = new Date(record.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
      <Link href={designLink(record)} className="grid place-items-center bg-surface-2 px-6 py-5" aria-label={`Open ${record.name} in the Studio`}>
        {svg ? (
          <div className="qr-canvas w-full max-w-[170px]" dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <div className="aspect-square w-full max-w-[170px] animate-pulse rounded-2xl bg-surface-3" />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {renaming ? (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onRename(record, name);
              setRenaming(false);
            }}
          >
            <input
              autoFocus
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              aria-label="New name"
              className="min-w-0 flex-1 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-sm text-text outline-none focus:border-primary"
            />
            <button type="submit" className="rounded-lg bg-primary px-3 text-xs font-semibold text-on-primary">
              Save
            </button>
          </form>
        ) : (
          <div>
            <h3 className="truncate text-base font-semibold text-text" title={record.name}>
              {record.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-subtle">
              <Icon name={type.icon} size={12} />
              {type.label} · {updated}
            </p>
          </div>
        )}

        {confirmDelete ? (
          <div className="mt-auto flex items-center justify-between gap-2 rounded-xl bg-danger-soft px-3 py-2 text-xs text-danger">
            Delete this design?
            <span className="flex gap-2">
              <button type="button" onClick={() => onDelete(record)} className="rounded-md bg-danger px-2.5 py-1 font-semibold text-white">
                Delete
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-md px-2 py-1 font-semibold">
                Cancel
              </button>
            </span>
          </div>
        ) : (
          <div className="mt-auto flex items-center gap-2">
            <Link href={designLink(record)} className="bg-brand-gradient flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-on-primary">
              <Icon name="wand" size={15} />
              Open
            </Link>
            <button type="button" onClick={download} disabled={!svg} className={iconButton} aria-label="Download PNG" title="Download PNG">
              <Icon name="download" size={16} />
            </button>
            <button type="button" onClick={() => setRenaming(true)} className={iconButton} aria-label="Rename" title="Rename">
              <Icon name="edit" size={16} />
            </button>
            <button type="button" onClick={() => onDuplicate(record)} className={iconButton} aria-label="Duplicate" title="Duplicate">
              <Icon name="copy" size={16} />
            </button>
            <button type="button" onClick={() => setConfirmDelete(true)} className={`${iconButton} hover:text-danger`} aria-label="Delete" title="Delete">
              <Icon name="trash" size={16} />
            </button>
          </div>
        )}
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </article>
  );
}
