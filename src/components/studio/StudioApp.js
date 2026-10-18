"use client";

import { useCallback, useEffect, useState } from "react";
import Hero from "../layout/Hero";
import QrStudio from "./QrStudio";
import { QR_TYPE_MAP, DEFAULT_TYPE_ID, getQrType } from "@/qr-types";
import { TEMPLATE_MAP } from "@/config/templates";
import { decodePrefill } from "@/lib/studioLink";
import { getDesign } from "@/lib/library/db";

// Studio page logic: which QR type is selected (kept in the URL hash, e.g. /#wifi),
// and whether we arrived with something to load (see lib/studioLink.js).
// `initialTypeId` is used by the per-type pages, e.g. /wifi-qr-code-generator.
export default function StudioApp({ initialTypeId = DEFAULT_TYPE_ID, showHero = true }) {
  const [typeId, setTypeId] = useState(initialTypeId);
  const [incoming, setIncoming] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const readHash = () => {
      const id = window.location.hash.replace("#", "");
      if (QR_TYPE_MAP[id]) setTypeId(id);
    };
    readHash();
    window.addEventListener("hashchange", readHash);

    const params = new URLSearchParams(window.location.search);
    const template = params.get("template");
    const designId = params.get("design");
    const prefill = params.get("prefill");
    const hashType = window.location.hash.replace("#", "");

    if (template && TEMPLATE_MAP[template]) {
      setIncoming({ templateStyle: TEMPLATE_MAP[template].style, pane: "design" });
    } else if (designId) {
      getDesign(designId)
        .then((record) => {
          if (!record) throw new Error("That saved design wasn't found in this browser.");
          setTypeId(record.typeId);
          setIncoming({ typeId: record.typeId, values: record.values, style: record.style, saved: { id: record.id, name: record.name } });
        })
        .catch((err) => setLoadError(err.message));
    } else if (prefill && QR_TYPE_MAP[hashType]) {
      const values = decodePrefill(prefill);
      if (values) setIncoming({ typeId: hashType, values });
    }

    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  const selectType = useCallback((id) => {
    setTypeId(id);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${id}`);
  }, []);

  // Once loaded, drop the parameters so a refresh doesn't load them again.
  const clearIncoming = useCallback(() => {
    setIncoming(null);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.hash}`);
  }, []);

  const type = getQrType(typeId);

  return (
    <>
      {showHero && (
        <Hero icon={type.icon} title={<>Make a QR code for <span className="text-brand-gradient">{type.label}</span></>} description={type.description} />
      )}
      {loadError && (
        <p role="alert" className="rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
          {loadError}
        </p>
      )}
      <QrStudio typeId={typeId} onTypeChange={selectType} incoming={incoming} onIncomingApplied={clearIncoming} />
    </>
  );
}
