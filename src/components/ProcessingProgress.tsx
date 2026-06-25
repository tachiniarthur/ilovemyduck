"use client";

import Icon from "./Icon";

interface ProcessingProgressProps {
  ratio: number; // 0..1
  message: string;
}

export default function ProcessingProgress({ ratio, message }: ProcessingProgressProps) {
  const percent = Math.round(Math.max(0, Math.min(1, ratio)) * 100);

  return (
    <div className="card p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-duck-100 text-bill-600">
          <Icon name="scissors" size={22} />
        </span>
        <div className="min-w-0">
          <p className="text-balance font-display text-xl font-semibold leading-tight text-ink">
            {message}
          </p>
          <p className="mt-0.5 font-body text-sm text-ink-muted">
            O patinho está nadando pelos seus frames… 🌊
          </p>
        </div>
        <span className="ml-auto shrink-0 font-display text-3xl font-semibold tabular-nums text-bill-600">
          {percent}%
        </span>
      </div>

      {/* Progress track */}
      <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-cream-200 ring-1 ring-bark-200">
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

      <p className="mt-3 font-body text-xs text-bark-500">
        Não feche essa aba, o patinho está trabalhando duro!
      </p>
    </div>
  );
}
