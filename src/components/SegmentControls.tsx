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
    <div className="rounded-4xl bg-white/80 p-5 shadow-soft ring-1 ring-duck-200">
      {/* Segment length */}
      <fieldset disabled={disabled}>
        <legend className="font-display text-base font-extrabold text-bill-600">
          Tamanho de cada parte
        </legend>
        <p className="mt-0.5 font-body text-xs text-duck-700/70">
          O Instagram aceita até 60s por Story 😉
        </p>

        <div
          className="mt-3 grid grid-cols-3 gap-2"
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
                className={`rounded-2xl border-2 px-2 py-3 text-center font-display text-lg font-extrabold transition-all
                  ${
                    active
                      ? "border-bill-500 bg-duck-400 text-bill-700 shadow-pop"
                      : "border-duck-200 bg-white text-duck-700 hover:border-duck-400"
                  }
                  disabled:cursor-not-allowed disabled:opacity-60`}
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
        className="mt-4 flex items-center gap-2 rounded-2xl bg-pond-300/40 px-4 py-3"
      >
        <span className="text-xl" aria-hidden>
          🦆
        </span>
        <p className="font-body text-sm font-bold text-pond-600">
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
