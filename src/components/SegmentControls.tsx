"use client";

import type { SegmentDuration } from "@/types";
import { partsSentence } from "@/lib/format";
import CutTimeline from "./CutTimeline";

const DURATIONS: SegmentDuration[] = [15, 30, 60];

interface SegmentControlsProps {
  duration: number; // total video duration
  segment: SegmentDuration;
  onSegmentChange: (value: SegmentDuration) => void;
  cutTimes: number[];
  onCutTimesChange: (value: number[]) => void;
  disabled?: boolean;
}

export default function SegmentControls({
  duration,
  segment,
  onSegmentChange,
  cutTimes,
  onCutTimesChange,
  disabled,
}: SegmentControlsProps) {
  return (
    <div className="duck-card">
      {/* Segment length */}
      <fieldset disabled={disabled}>
        <legend className="section-title">Tamanho de cada parte</legend>
        <p className="mt-1 font-body text-xs leading-relaxed text-duck-700/70">
          O Instagram aceita até 60s por Story 😉
        </p>

        <div
          className="mt-4 grid grid-cols-3 gap-2.5"
          role="radiogroup"
          aria-label="Duração de cada segmento"
        >
          {DURATIONS.map((value) => {
            const active = value === segment;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSegmentChange(value)}
                disabled={disabled}
                className={`rounded-2xl border-2 px-2 py-3 text-center font-display text-lg font-extrabold transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-[var(--ease-soft)]
                  ${
                    active
                      ? "-translate-y-0.5 border-bill-500 bg-duck-400 text-bill-700 shadow-pop"
                      : "border-duck-200 bg-white text-duck-700 hover:-translate-y-0.5 hover:border-duck-400 hover:bg-duck-50 active:translate-y-0"
                  }
                  disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60`}
              >
                {value}s
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Live part count */}
      <div
        aria-live="polite"
        className="mt-5 flex items-center gap-2.5 rounded-2xl bg-pond-300/40 px-4 py-3 ring-1 ring-pond-400/30"
      >
        <span className="text-xl" aria-hidden>
          🦆
        </span>
        <p className="font-body text-sm font-bold leading-snug text-pond-600">
          {partsSentence(duration, segment)}
        </p>
      </div>

      {/* Manual cut points timeline */}
      <CutTimeline
        duration={duration}
        cutTimes={cutTimes}
        onChange={onCutTimesChange}
        approximate
        disabled={disabled}
      />
    </div>
  );
}
