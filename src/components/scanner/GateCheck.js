"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import CameraScanner from "./CameraScanner";
import { checkTicket, emptyGate, gateCsv, gateStats, parseTicketList, sanitizeGate } from "@/lib/scan/gate";
import { codesForRange } from "@/lib/print/bulk";

const KEY = "qrcraft-gate-v1";
const input = "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-text outline-none placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/15";

function load() {
  try {
    return sanitizeGate(JSON.parse(localStorage.getItem(KEY) || "null"));
  } catch {
    return emptyGate();
  }
}

function persist(gate) {
  try {
    localStorage.setItem(KEY, JSON.stringify(gate));
    return true;
  } catch {
    return false;
  }
}

// Short beep + vibration so the guard doesn't have to look at the screen.
function feedback(ok) {
  try {
    navigator.vibrate?.(ok ? 80 : [120, 80, 120]);
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = ok ? 880 : 220;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (ok ? 0.12 : 0.35));
    osc.onended = () => ctx.close();
  } catch {
    // Sound is optional.
  }
}

const RESULT = {
  valid: { icon: "checkCircle", title: "Valid ticket", cls: "border-success/40 bg-success-soft text-success" },
  used: { icon: "alert", title: "Already used", cls: "border-warning/40 bg-warning-soft text-warning" },
  unknown: { icon: "x", title: "Not on the list", cls: "border-danger/40 bg-danger-soft text-danger" },
  empty: { icon: "info", title: "Load your ticket list first", cls: "border-line bg-surface-2 text-muted" },
};

const time = (t) => new Date(t).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

function Setup({ gate, onLoad }) {
  const [mode, setMode] = useState("range");
  const [range, setRange] = useState({ prefix: "", start: "1", count: "100", digits: "5" });
  const [text, setText] = useState("");
  const preview = mode === "range" ? codesForRange(range.prefix, range.start, range.count, range.digits) : parseTicketList(text);

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="How to add tickets" className="flex gap-1 rounded-xl border border-line bg-surface-2 p-1">
        {[
          ["range", "Number range"],
          ["paste", "Paste / upload list"],
        ].map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => setMode(id)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === id ? "bg-surface text-primary-text shadow-card" : "text-muted hover:text-text"}`}>
            {label}
          </button>
        ))}
      </div>
      {mode === "range" ? (
        <>
          <p className="text-xs text-muted">Use the same prefix, start, count and digits you used for the wristbands in the Print Studio.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["prefix", "Prefix", "NNF26-"],
              ["start", "Start", "1"],
              ["count", "How many", "100"],
              ["digits", "Digits", "5"],
            ].map(([key, label, ph]) => (
              <label key={key} className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
                {label}
                <input className={input} value={range[key]} placeholder={ph} inputMode={key === "prefix" ? "text" : "numeric"} onChange={(e) => setRange((r) => ({ ...r, [key]: key === "prefix" ? e.target.value.slice(0, 12) : e.target.value.replace(/\D/g, "").slice(0, 5) }))} />
              </label>
            ))}
          </div>
        </>
      ) : (
        <>
          <textarea className={`${input} min-h-[120px] font-mono text-xs`} value={text} onChange={(e) => setText(e.target.value)} placeholder={"NNF26-00001\nNNF26-00002\n…"} />
          <label className="flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-text hover:border-line-strong">
            <Icon name="upload" size={14} />
            Upload .txt or .csv
            <input
              type="file"
              accept=".txt,.csv,text/plain,text/csv"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file && file.size < 5_000_000) setText(await file.text());
              }}
            />
          </label>
        </>
      )}
      <p className="text-xs text-muted">
        {preview.length ? (
          <>
            {preview.length} tickets: <b className="font-mono text-text">{preview[0]}</b>
            {preview.length > 1 && (
              <>
                {" "}to <b className="font-mono text-text">{preview[preview.length - 1]}</b>
              </>
            )}
          </>
        ) : (
          "No tickets yet."
        )}
      </p>
      <button type="button" disabled={!preview.length} onClick={() => onLoad(preview)} className="bg-brand-gradient flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-on-primary disabled:opacity-40">
        <Icon name="check" size={16} />
        {gate.codes.length ? "Replace the ticket list" : "Use this ticket list"}
      </button>
    </div>
  );
}

export default function GateCheck() {
  const [gate, setGate] = useState(emptyGate);
  const [last, setLast] = useState(null);
  const [manual, setManual] = useState("");
  const [setupOpen, setSetupOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [storageOk, setStorageOk] = useState(true);
  const gateRef = useRef(gate);

  useEffect(() => {
    const g = load();
    gateRef.current = g;
    setGate(g);
    setSetupOpen(g.codes.length === 0);
  }, []);

  const save = useCallback((g) => {
    gateRef.current = g;
    setGate(g);
    setStorageOk(persist(g));
  }, []);

  // The camera calls this; reading the ref keeps it stable while scanning.
  const check = useCallback(
    (text) => {
      const result = checkTicket(gateRef.current, text);
      if (result.status !== "empty") save(result.gate);
      setLast({ ...result, at: Date.now() });
      feedback(result.status === "valid");
    },
    [save],
  );

  const { total, checkedIn } = gateStats(gate);
  const r = last ? RESULT[last.status] : null;

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section aria-label="Gate scanner" className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-text">
            <Icon name="gate" size={18} className="text-primary-text" />
            Gate check
          </h2>
          <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary-text" aria-live="polite">
            {checkedIn} / {total} in
          </span>
        </div>

        {r && (
          <div role="status" aria-live="assertive" className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 ${r.cls}`}>
            <Icon name={r.icon} size={34} strokeWidth={2.2} />
            <div className="min-w-0">
              <p className="text-xl font-bold">{r.title}</p>
              <p className="truncate font-mono text-sm">{last.code}</p>
              {last.status === "used" && <p className="text-sm">Checked in at {time(last.usedAt)}</p>}
            </div>
          </div>
        )}

        <CameraScanner onResult={check} continuous />

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (manual.trim()) check(manual);
            setManual("");
          }}
        >
          <input className={input} value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Or type a ticket code" aria-label="Ticket code" />
          <button type="submit" className="rounded-xl border border-line px-4 text-sm font-semibold text-text hover:border-line-strong">
            Check
          </button>
        </form>
        {!storageOk && <p className="text-xs text-danger">This browser isn't saving check-ins (private mode or storage full). Keep this tab open.</p>}
      </section>

      <section aria-label="Ticket list" className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-4 shadow-card sm:p-5">
          <button type="button" onClick={() => setSetupOpen((o) => !o)} className="flex items-center justify-between gap-2 text-left">
            <span className="flex items-center gap-2 text-base font-semibold text-text">
              <Icon name="ticket" size={18} className="text-primary-text" />
              Ticket list
              <span className="text-sm font-normal text-muted">{total ? `${total} loaded` : "not loaded"}</span>
            </span>
            <Icon name="chevron" size={16} className={`text-subtle transition ${setupOpen ? "rotate-180" : ""}`} />
          </button>
          {setupOpen && (
            <Setup
              gate={gate}
              onLoad={(codes) => {
                const keep = new Set(codes);
                save({ ...gate, codes, used: Object.fromEntries(Object.entries(gate.used).filter(([c]) => keep.has(c))) });
                setSetupOpen(false);
                setLast(null);
              }}
            />
          )}
          <p className="flex gap-1.5 text-xs text-muted">
            <Icon name="lock" size={14} className="mt-px shrink-0 text-subtle" />
            The list and check-ins stay on this phone. With 2 gates, each phone keeps its own record, so a ticket could get in once at each gate.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-4 shadow-card sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-text">Recent scans</h3>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!total}
                onClick={() => {
                  const url = URL.createObjectURL(new Blob([gateCsv(gate)], { type: "text/csv" }));
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `check-ins-${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-text hover:border-line-strong disabled:opacity-50"
              >
                <Icon name="download" size={14} />
                Export CSV
              </button>
            </div>
          </div>
          {gate.log.length === 0 ? (
            <p className="text-xs text-muted">Scans show up here.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {gate.log.slice(0, 12).map((l, i) => (
                <li key={`${l.at}-${i}`} className="flex items-center gap-2 py-2 text-sm">
                  <Icon name={RESULT[l.status].icon} size={16} className={l.status === "valid" ? "text-success" : l.status === "used" ? "text-warning" : "text-danger"} />
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-text">{l.code}</span>
                  <span className="text-xs text-subtle">{time(l.at)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2 border-t border-line pt-3">
            {confirm ? (
              <span className="flex flex-wrap items-center gap-2 text-xs text-danger">
                {confirm === "reset" ? "Mark every ticket as not checked in?" : "Remove the list and all check-ins?"}
                <button
                  type="button"
                  onClick={() => {
                    save(confirm === "reset" ? { ...gate, used: {}, log: [] } : emptyGate());
                    setConfirm(null);
                    setLast(null);
                    if (confirm === "clear") setSetupOpen(true);
                  }}
                  className="rounded-md bg-danger px-2.5 py-1 font-semibold text-white"
                >
                  Yes
                </button>
                <button type="button" onClick={() => setConfirm(null)} className="rounded-md px-2 py-1 font-semibold">
                  Cancel
                </button>
              </span>
            ) : (
              <>
                <button type="button" disabled={!checkedIn} onClick={() => setConfirm("reset")} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted hover:bg-surface-2 hover:text-text disabled:opacity-50">
                  Reset check-ins
                </button>
                <button type="button" disabled={!total} onClick={() => setConfirm("clear")} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger-soft disabled:opacity-50">
                  Clear everything
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
