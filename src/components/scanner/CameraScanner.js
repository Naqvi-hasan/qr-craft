"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import { decodeImageData, imageDataFrom } from "@/lib/qr/decoder";

const SCAN_EVERY_MS = 250;

function cameraError(err) {
  if (typeof window !== "undefined" && !window.isSecureContext) return "The camera only works on a secure (https) page. Open the live site, or upload a photo instead.";
  switch (err?.name) {
    case "NotAllowedError":
      return "Camera permission was blocked. Allow the camera in your browser's site settings, or upload a photo instead.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "No camera found on this device. Upload a photo of the QR instead.";
    case "NotReadableError":
      return "Another app is using the camera. Close it and try again.";
    default:
      return "Couldn't start the camera. Upload a photo of the QR instead.";
  }
}

// Live camera scanning. The camera starts only when the user presses Start,
// and stops as soon as a code is found or the user leaves.
export default function CameraScanner({ onResult }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [state, setState] = useState("idle"); // idle | starting | scanning | error
  const [error, setError] = useState(null);

  function stop() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  useEffect(() => stop, []);

  useEffect(() => {
    if (state !== "scanning") return;
    let cancelled = false;
    let timer;
    const tick = async () => {
      const video = videoRef.current;
      if (cancelled || !video) return;
      if (video.readyState >= 2 && video.videoWidth) {
        try {
          const found = await decodeImageData(imageDataFrom(video, video.videoWidth, video.videoHeight, 720));
          if (found && !cancelled) {
            stop();
            setState("idle");
            onResult(found.text);
            return;
          }
        } catch {
          // A bad frame: keep trying.
        }
      }
      timer = setTimeout(tick, SCAN_EVERY_MS);
    };
    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [state, onResult]);

  async function start() {
    setError(null);
    setState("starting");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      setState("scanning");
    } catch (err) {
      stop();
      setError(cameraError(err));
      setState("error");
    }
  }

  const live = state === "scanning" || state === "starting";

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-black sm:aspect-video">
        <video ref={videoRef} playsInline muted className={`h-full w-full object-cover ${live ? "" : "opacity-0"}`} />
        {live ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="aspect-square w-3/5 max-w-[280px] rounded-3xl border-4 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
            <p className="absolute bottom-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">Point at a QR code</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white">
            <Icon name="camera" size={36} />
            <p className="max-w-xs text-sm text-white/80">{error || "Your camera is used only on this device. Nothing is recorded or uploaded."}</p>
          </div>
        )}
      </div>
      {live ? (
        <button
          type="button"
          onClick={() => {
            stop();
            setState("idle");
          }}
          className="flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-text hover:border-line-strong"
        >
          <Icon name="x" size={16} />
          Stop camera
        </button>
      ) : (
        <button type="button" onClick={start} className="bg-brand-gradient flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-on-primary">
          <Icon name="camera" size={18} />
          {state === "error" ? "Try the camera again" : "Start camera"}
        </button>
      )}
    </div>
  );
}
