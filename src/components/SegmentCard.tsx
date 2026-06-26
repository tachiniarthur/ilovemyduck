"use client";

import { useState } from "react";
import type { VideoSegment } from "@/types";
import { formatDuration } from "@/lib/format";
import { saveSegment } from "@/lib/share";
import Icon from "./Icon";
import ButtonSpinner from "./ButtonSpinner";

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

  const label = saveMode === "share" ? "Salvar na galeria" : "Baixar parte";

  return (
    <div className="card animate-pop-in overflow-hidden p-0 transition-shadow duration-200 ease-[var(--ease-soft)] hover:shadow-card-lift">
      <div className="relative bg-ink">
        <video
          src={segment.url}
          controls
          playsInline
          preload="metadata"
          className="aspect-video max-h-72 w-full bg-ink object-contain"
        />
        <span className="absolute left-2 top-2 rounded-md bg-bill-600 px-2 py-0.5 font-mono text-xs font-medium text-white shadow ring-1 ring-white/20">
          Parte {String(segment.index).padStart(2, "0")}
        </span>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="inline-flex shrink-0 items-center gap-1 font-mono text-xs text-ink-soft">
            <Icon name="clock" size={12} />
            {formatDuration(segment.duration)}
          </p>
          <p className="min-w-0 truncate font-mono text-[10px] tracking-wide text-bark-400">
            {segment.fileName}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving"}
          className={`btn mt-2.5 w-full px-3 py-2.5 text-sm disabled:cursor-wait disabled:opacity-80
            ${
              status === "saved"
                ? "bg-pond-600 text-white shadow-button"
                : status === "error"
                  ? "bg-bill-600 text-white shadow-button"
                  : "border border-bark-200 bg-cream-50 text-ink shadow-button hover:border-bark-300 hover:bg-cream-100"
            }`}
        >
          {status === "saving" && <ButtonSpinner />}
          {status !== "saving" && status !== "error" && (
            <Icon name={saveMode === "share" ? "stories" : "download"} size={16} />
          )}
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
