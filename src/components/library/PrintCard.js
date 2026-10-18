"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import { PRODUCT_MAP } from "@/lib/print/products";
import { previewValues, renderSide } from "@/lib/print/engine";
import { sanitizeState } from "@/lib/print/record";

const iconButton = "grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:border-line-strong hover:text-text";

// One saved Print Studio design in the library.
export default function PrintCard({ record, onRename, onDuplicate, onDelete }) {
  const product = PRODUCT_MAP[record.productId];
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(record.name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { svg, width } = useMemo(() => {
    try {
      const state = sanitizeState(product, record.state);
      const { values, qrValues } = previewValues(product, state.values, state.layouts[product.sides[0].id]);
      const out = renderSide(product, state, product.sides[0].id, values, qrValues);
      // Fit inside a 210 × 150 px box whatever the paper shape.
      return { svg: out?.svg ?? "", width: Math.round(Math.min(210, (150 * out.W) / out.H)) };
    } catch {
      return { svg: "", width: 150 };
    }
  }, [product, record.state]);

  const href = `/cards?design=${encodeURIComponent(record.id)}#${record.productId}`;
  const updated = new Date(record.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
      <Link href={href} className="grid h-[182px] place-items-center bg-surface-2 px-4 py-4" aria-label={`Open ${record.name} in the Print Studio`}>
        <div className="qr-canvas overflow-hidden rounded-md shadow-card" style={{ width }} dangerouslySetInnerHTML={{ __html: svg }} />
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
            <input autoFocus value={name} maxLength={60} onChange={(e) => setName(e.target.value)} aria-label="New name" className="min-w-0 flex-1 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-sm text-text outline-none focus:border-primary" />
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
              <Icon name={product.icon} size={12} />
              {product.label} · {updated}
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
            <Link href={href} className="bg-brand-gradient flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-on-primary">
              <Icon name="printer" size={15} />
              Open
            </Link>
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
      </div>
    </article>
  );
}
