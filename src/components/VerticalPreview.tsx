"use client";

import type { VerticalMode } from "@/types";

interface VerticalPreviewProps {
  url: string;
  mode: Exclude<VerticalMode, "off">;
}

const LABELS: Record<Exclude<VerticalMode, "off">, string> = {
  fill: "Preenchendo a tela (corta as bordas)",
  blur: "Fundo desfocado do próprio vídeo",
  color: "Fundo azulzinho de pato",
};

/**
 * A live, CSS-only approximation of how each part will be framed at 9:16, shown
 * before processing so the user knows what to expect. Mirrors the FFmpeg
 * filters in lib/ffmpeg.ts (cover-crop / blurred backdrop / solid pad).
 */
export default function VerticalPreview({ url, mode }: VerticalPreviewProps) {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/70 p-3 ring-1 ring-duck-200">
      <div className="relative aspect-[9/16] h-40 shrink-0 overflow-hidden rounded-xl bg-sky-200 shadow-soft">
        {mode === "blur" && (
          <video
            src={url}
            muted
            loop
            playsInline
            autoPlay
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-md"
            aria-hidden
          />
        )}
        <video
          src={url}
          muted
          loop
          playsInline
          autoPlay
          className={`relative h-full w-full ${
            mode === "fill" ? "object-cover" : "object-contain"
          }`}
        />
      </div>

      <div>
        <p className="font-display text-sm font-extrabold text-sky-500">
          Prévia do resultado
        </p>
        <p className="font-body text-xs text-duck-700/70">{LABELS[mode]}</p>
        <p className="mt-1 font-body text-[11px] text-duck-700/50">
          Quadro 1080×1920, pronto para os Stories.
        </p>
      </div>
    </div>
  );
}
