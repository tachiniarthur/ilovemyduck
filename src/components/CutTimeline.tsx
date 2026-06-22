"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatDuration, segmentsMeta } from "@/lib/format";

interface CutTimelineProps {
  duration: number;
  cutTimes: number[]; // internal cut points (sorted, exclusive of 0 and end)
  onChange: (next: number[]) => void;
  /** Whether the fast (copy) path is active — shows the keyframe-snap hint. */
  approximate: boolean;
  disabled?: boolean;
}

const MIN_GAP = 1; // seconds — keep parts from collapsing onto each other

// Alternating block tints so neighbouring parts are easy to tell apart.
const BLOCK_TINTS = [
  "bg-duck-200/70",
  "bg-sky-200/70",
  "bg-pond-300/60",
  "bg-bill-400/40",
];

export default function CutTimeline({
  duration,
  cutTimes,
  onChange,
  approximate,
  disabled,
}: CutTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const sorted = [...cutTimes].sort((a, b) => a - b);
  const metas = segmentsMeta(sorted, duration);

  const timeFromClientX = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) return 0;
      const rect = track.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      return Math.max(0, Math.min(1, ratio)) * duration;
    },
    [duration],
  );

  // While dragging a handle, follow the pointer and keep cuts ordered + spaced.
  useEffect(() => {
    if (dragIndex === null) return;

    const move = (clientX: number) => {
      let time = timeFromClientX(clientX);
      const lower = dragIndex === 0 ? MIN_GAP : sorted[dragIndex - 1] + MIN_GAP;
      const upper =
        dragIndex === sorted.length - 1
          ? duration - MIN_GAP
          : sorted[dragIndex + 1] - MIN_GAP;
      time = Math.max(lower, Math.min(upper, time));

      const next = [...sorted];
      next[dragIndex] = Math.round(time * 100) / 100;
      onChange(next);
    };

    const onPointerMove = (e: PointerEvent) => move(e.clientX);
    const onPointerUp = () => setDragIndex(null);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [dragIndex, sorted, duration, onChange, timeFromClientX]);

  const removeCut = (i: number) => {
    if (disabled) return;
    onChange(sorted.filter((_, idx) => idx !== i));
  };

  const addCut = () => {
    if (disabled) return;
    // Drop a new cut in the middle of the currently longest part.
    let longest = metas[0];
    for (const m of metas) if (m.duration > longest.duration) longest = m;
    const mid = (longest.start + longest.end) / 2;
    if (mid <= MIN_GAP || mid >= duration - MIN_GAP) return;
    const next = [...sorted, Math.round(mid * 100) / 100].sort((a, b) => a - b);
    onChange(next);
  };

  const resetCuts = () => {
    if (disabled) return;
    onChange([]); // page recomputes a uniform layout from the segment size
  };

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-display text-base font-extrabold text-bill-600">
            Pontos de corte
          </p>
          <p className="font-body text-xs text-duck-700/70">
            Arraste as alcinhas 🦆 para cortar sem atropelar a fala.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-pond-300/50 px-2.5 py-1 font-display text-xs font-extrabold text-pond-600">
          {metas.length} {metas.length === 1 ? "parte" : "partes"}
        </span>
      </div>

      {/* Track with proportional part blocks + draggable handles */}
      <div className="mt-3 select-none">
        <div
          ref={trackRef}
          className="relative flex h-12 w-full touch-none overflow-hidden rounded-2xl ring-1 ring-duck-200"
        >
          {metas.map((m, i) => (
            <div
              key={i}
              className={`flex h-full items-center justify-center ${
                BLOCK_TINTS[i % BLOCK_TINTS.length]
              }`}
              style={{ width: `${(m.duration / duration) * 100}%` }}
            >
              <span className="font-display text-xs font-extrabold text-duck-700/80">
                {m.index}
              </span>
            </div>
          ))}

          {/* Draggable cut handles sit on top of the blocks */}
          {sorted.map((time, i) => (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onPointerDown={(e) => {
                if (disabled) return;
                e.preventDefault();
                setDragIndex(i);
              }}
              aria-label={`Ponto de corte ${i + 1} em ${formatDuration(time)}`}
              className={`absolute top-0 h-full w-6 -translate-x-1/2 cursor-ew-resize touch-none
                disabled:cursor-not-allowed`}
              style={{ left: `${(time / duration) * 100}%` }}
            >
              <span
                className={`mx-auto block h-full w-1.5 rounded-full transition-colors ${
                  dragIndex === i ? "bg-bill-600" : "bg-bill-500"
                }`}
              />
              <span className="pointer-events-none absolute -top-1 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-bill-500 shadow ring-2 ring-white" />
            </button>
          ))}
        </div>

        {/* Per-cut chips: time + remove */}
        {sorted.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sorted.map((time, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-body text-xs font-semibold text-duck-700 ring-1 ring-duck-200"
              >
                ✂️ {formatDuration(time)}
                <button
                  type="button"
                  onClick={() => removeCut(i)}
                  disabled={disabled}
                  aria-label={`Remover ponto de corte em ${formatDuration(time)}`}
                  className="text-bill-500 hover:text-bill-600 disabled:opacity-50"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={addCut}
          disabled={disabled}
          className="rounded-full bg-duck-400 px-3 py-1.5 font-display text-xs font-extrabold text-bill-700 shadow-pop transition-all hover:bg-duck-300 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
        >
          + Adicionar corte
        </button>
        <button
          type="button"
          onClick={resetCuts}
          disabled={disabled}
          className="rounded-full px-3 py-1.5 font-display text-xs font-extrabold text-bill-600 underline decoration-wavy underline-offset-2 hover:text-bill-500 disabled:opacity-50"
        >
          Voltar ao padrão
        </button>
      </div>

      {approximate && (
        <p className="mt-2 font-body text-[11px] text-duck-700/60">
          No modo rápido, cada corte encaixa no quadro-chave mais próximo do ponto
          escolhido — pode variar uns instantinhos. 🦆
        </p>
      )}
    </div>
  );
}
