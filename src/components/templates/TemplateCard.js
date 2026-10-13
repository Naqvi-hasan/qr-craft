"use client";

import { useMemo } from "react";
import Link from "next/link";
import Icon from "../Icon";
import { DEFAULT_STYLE } from "@/config/qrStyle";
import { applyPreset } from "@/lib/qr/style";
import { getQrType } from "@/qr-types";
import { useQrDesign } from "@/hooks/useQrDesign";

const SAMPLE_PAYLOAD = "https://qrcraft.app";

// One template: a real, scannable preview plus a button that opens it in the Studio.
export default function TemplateCard({ template }) {
  const style = useMemo(() => applyPreset(DEFAULT_STYLE, template.style), [template.style]);
  const { svg } = useQrDesign(SAMPLE_PAYLOAD, style, 320);
  const type = getQrType(template.typeId);

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card transition hover:-translate-y-0.5 hover:border-line-strong">
      <div className="grid place-items-center bg-surface-2 px-6 py-6">
        {svg ? (
          <div className="qr-canvas w-full max-w-[200px]" role="img" aria-label={`${template.name} QR design`} dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <div className="aspect-square w-full max-w-[200px] animate-pulse rounded-2xl bg-surface-3" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-text">{template.name}</h3>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary-text">
              <Icon name={type.icon} size={12} />
              {type.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{template.description}</p>
        </div>
        <Link
          href={`/?template=${template.id}#${template.typeId}`}
          className="bg-brand-gradient mt-auto flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-on-primary transition hover:brightness-110"
        >
          Use this template
          <Icon name="arrowRight" size={16} />
        </Link>
      </div>
    </article>
  );
}
