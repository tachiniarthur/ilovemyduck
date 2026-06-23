"use client";

import DuckMascot from "./DuckMascot";

interface ProcessingProgressProps {
  ratio: number; // 0..1
  message: string;
}

export default function ProcessingProgress({ ratio, message }: ProcessingProgressProps) {
  const percent = Math.round(Math.max(0, Math.min(1, ratio)) * 100);

  return (
    <div className="rounded-4xl bg-white/80 p-6 shadow-soft ring-1 ring-duck-200">
      <div className="flex flex-col items-center text-center">
        <DuckMascot size={96} mood="processing" />
        <p className="mt-3 text-balance font-display text-xl font-extrabold tracking-tight text-bill-600">
          {message}
        </p>
        <p className="font-body text-sm text-duck-700/70">
          O patinho está nadando pelos seus frames… 🌊
        </p>
      </div>

      {/* Progress track with a duck riding the wave */}
      <div className="relative mt-6">
        <div className="h-5 w-full overflow-hidden rounded-full bg-sky-200">
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-duck-400 to-bill-500 transition-[width] duration-300 ease-out"
            style={{ width: `${percent}%` }}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso do fatiamento"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* The little duck floating on top of the bar */}
        <span
          className="pointer-events-none absolute -top-3 text-2xl transition-[left] duration-300 ease-out animate-bob"
          style={{ left: `calc(${percent}% - 12px)` }}
          aria-hidden
        >
          🦆
        </span>
      </div>

      <p className="mt-3 text-center font-display text-2xl font-extrabold text-bill-600">
        {percent}%
      </p>
      <p className="text-center font-body text-xs text-duck-700/60">
        Não feche essa aba — o patinho está trabalhando duro!
      </p>
    </div>
  );
}
