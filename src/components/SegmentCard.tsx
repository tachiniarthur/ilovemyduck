"use client";

import { useState } from "react";
import type { VideoSegment } from "@/types";
import { formatDuration } from "@/lib/format";
import { saveSegment } from "@/lib/share";

interface SegmentCardProps {
  segment: VideoSegment;
  saveMode: "share" | "download";
}

export default function SegmentCard({ segment, saveMode }: SegmentCardProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const handleSave = async () => {
    setStatus("saving");
    try {
      const result = await saveSegment(segment);
      setStatus(result === "cancelled" ? "idle" : "saved");
      // Let the success state linger briefly, then reset.
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  };

  const label =
    saveMode === "share" ? "Salvar na galeria" : "Baixar parte";

  return (
    <div className="animate-pop-in overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-duck-200">
      <div className="relative bg-black">
        <video
          src={segment.url}
          controls
          playsInline
          preload="metadata"
          className="aspect-[9/16] max-h-72 w-full bg-black object-contain"
        />
        <span className="absolute left-2 top-2 rounded-full bg-bill-500 px-2.5 py-1 font-display text-xs font-extrabold text-white shadow">
          Parte {String(segment.index).padStart(2, "0")}
        </span>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between">
          <p className="font-body text-xs font-semibold text-duck-700/80">
            ⏱ {formatDuration(segment.duration)}
          </p>
          <p className="font-body text-[10px] text-duck-700/50">
            {segment.fileName}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving"}
          className={`mt-2 w-full rounded-2xl px-3 py-2.5 font-display text-sm font-extrabold transition-all
            ${
              status === "saved"
                ? "bg-pond-500 text-white"
                : status === "error"
                  ? "bg-bill-600 text-white"
                  : "bg-duck-400 text-bill-700 shadow-pop hover:bg-duck-300 active:translate-y-0.5 active:shadow-none"
            }
            disabled:cursor-wait disabled:opacity-80`}
        >
          {status === "saving"
            ? "Mandando o patinho…"
            : status === "saved"
              ? saveMode === "share"
                ? "Quack! Confira a galeria 🦆"
                : "Baixado! 🦆"
              : status === "error"
                ? "Ops, tenta de novo"
                : label}
        </button>
      </div>
    </div>
  );
}
