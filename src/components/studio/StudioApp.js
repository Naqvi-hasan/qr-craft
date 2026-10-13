"use client";

import { useCallback, useEffect, useState } from "react";
import Hero from "../layout/Hero";
import QrStudio from "./QrStudio";
import { QR_TYPE_MAP, DEFAULT_TYPE_ID, getQrType } from "@/qr-types";
import { TEMPLATE_MAP } from "@/config/templates";

// Studio page logic: which QR type is selected (kept in the URL hash, e.g. /#wifi)
// and whether we arrived from the Templates page (/?template=cafe-menu#url).
export default function StudioApp() {
  const [typeId, setTypeId] = useState(DEFAULT_TYPE_ID);
  const [templateId, setTemplateId] = useState(null);

  useEffect(() => {
    const readHash = () => {
      const id = window.location.hash.replace("#", "");
      if (QR_TYPE_MAP[id]) setTypeId(id);
    };
    readHash();
    const template = new URLSearchParams(window.location.search).get("template");
    if (template && TEMPLATE_MAP[template]) setTemplateId(template);
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  const selectType = useCallback((id) => {
    setTypeId(id);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${id}`);
  }, []);

  // Once the template is applied, drop it from the URL so a refresh doesn't re-apply it.
  const clearTemplate = useCallback(() => {
    setTemplateId(null);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.hash}`);
  }, []);

  const type = getQrType(typeId);

  return (
    <>
      <Hero icon={type.icon} title={<>Make a QR code for <span className="text-brand-gradient">{type.label}</span></>} description={type.description} />
      <QrStudio typeId={typeId} onTypeChange={selectType} templateId={templateId} onTemplateApplied={clearTemplate} />
    </>
  );
}
