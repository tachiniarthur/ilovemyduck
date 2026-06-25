"use client";

import type { SegmentDuration } from "@/types";
import { partsSentence } from "@/lib/format";
import CutTimeline from "./CutTimeline";
import Icon from "./Icon";

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
    <div className="card p-5 sm:p-6">
      {/* Segment length */}
      <fieldset disabled={disabled}>
        <legend className="section-title">Tamanho de cada parte</legend>
        <p className="mt-1 font-body text-sm leading-relaxed text-ink-muted">
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
                className={`rounded-button border px-2 py-3 text-center font-display text-lg font-semibold transition-[background-color,border-color,color,box-shadow] duration-200 ease-[var(--ease-soft)]
                  ${
                    active
                      ? "border-bill-500 bg-bill-500/[0.08] text-bill-700 shadow-button"
                      : "border-bark-200 bg-cream-50 text-ink-soft hover:border-bark-300 hover:bg-cream-100"
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
        className="mt-5 flex items-center gap-2.5 rounded-button bg-pond-300/25 px-4 py-3 ring-1 ring-pond-400/30"
      >
        <span className="text-pond-700" aria-hidden>
          <Icon name="stories" size={18} />
        </span>
        <p className="font-body text-sm font-semibold leading-snug text-pond-700">
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
