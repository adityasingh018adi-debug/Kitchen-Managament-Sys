"use client";

import { useEffect, useRef, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface CameraCaptureProps {
  token: string;
  onUploaded: (url: string) => void;
  onError?: (message: string) => void;
  label?: string;
}

export function CameraCapture({ token, onUploaded, onError, label = "Capture" }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setActive(true);
    } catch {
      onError?.("Camera access denied or unavailable");
    }
  }

  function stop() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActive(false);
  }

  async function capture() {
    if (!videoRef.current) return;
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.drawImage(videoRef.current, 0, 0);
      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Capture failed"))), "image/jpeg", 0.9),
      );

      const formData = new FormData();
      formData.append("file", blob, "capture.jpg");
      const response = await fetch(`${API_BASE_URL}/uploads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const result = await response.json();
      onUploaded(result.url);
      stop();
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Capture failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {active ? (
        <div>
          <video ref={videoRef} autoPlay playsInline className="w-full max-w-xs rounded-lg bg-black" />
          <div className="mt-2 flex gap-2">
            <button
              onClick={capture}
              disabled={busy}
              className="rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-medium text-neutral-950 hover:bg-violet-400 disabled:opacity-50"
            >
              {busy ? "Uploading…" : label}
            </button>
            <button
              onClick={stop}
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={start}
          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
        >
          Open camera
        </button>
      )}
    </div>
  );
}
