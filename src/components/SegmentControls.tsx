"use client";

import type { SegmentDuration, VerticalMode } from "@/types";
import { partsSentence } from "@/lib/format";
import CutTimeline from "./CutTimeline";
import VerticalPreview from "./VerticalPreview";

const DURATIONS: SegmentDuration[] = [15, 30, 60];

interface SegmentControlsProps {
  duration: number; // total video duration
  videoUrl: string;
  segment: SegmentDuration;
  onSegmentChange: (value: SegmentDuration) => void;
  vertical: VerticalMode;
  onVerticalChange: (value: VerticalMode) => void;
  numbering: boolean;
  onNumberingChange: (value: boolean) => void;
  cutTimes: number[];
  onCutTimesChange: (value: number[]) => void;
  disabled?: boolean;
}

export default function SegmentControls({
  duration,
  videoUrl,
  segment,
  onSegmentChange,
  vertical,
  onVerticalChange,
  numbering,
  onNumberingChange,
  cutTimes,
  onCutTimesChange,
  disabled,
}: SegmentControlsProps) {
  const willReencode = vertical !== "off" || numbering;

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
        approximate={!willReencode}
        disabled={disabled}
      />

      <hr className="my-5 border-duck-200" />

      {/* Vertical 9:16 toggle */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-base font-extrabold text-bill-600">
              Formato Stories (9:16)
            </p>
            <p className="font-body text-xs text-duck-700/70">
              Deixa cada parte verticalzinha para o feed de Stories.
            </p>
          </div>
          <Toggle
            checked={vertical !== "off"}
            disabled={disabled}
            onChange={(on) => onVerticalChange(on ? "fill" : "off")}
            label="Ativar formato vertical 9:16"
          />
        </div>

        {vertical !== "off" && (
          <>
            <div
              className="mt-3 grid grid-cols-3 gap-2"
              role="radiogroup"
              aria-label="Modo de ajuste vertical"
            >
              <ModeOption
                active={vertical === "fill"}
                onClick={() => onVerticalChange("fill")}
                disabled={disabled}
                title="Preencher"
                subtitle="Corta as bordas"
              />
              <ModeOption
                active={vertical === "blur"}
                onClick={() => onVerticalChange("blur")}
                disabled={disabled}
                title="Desfocar"
                subtitle="Fundo borrado"
              />
              <ModeOption
                active={vertical === "color"}
                onClick={() => onVerticalChange("color")}
                disabled={disabled}
                title="Cor sólida"
                subtitle="Fundo azulzinho"
              />
            </div>

            <VerticalPreview url={videoUrl} mode={vertical} />
          </>
        )}
      </div>

      {/* Automatic part numbering */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-base font-extrabold text-bill-600">
            Numerar as partes
          </p>
          <p className="font-body text-xs text-duck-700/70">
            Carimba um selinho “1/{Math.max(1, cutTimes.length + 1)}” no canto de
            cada parte. 🦆
          </p>
        </div>
        <Toggle
          checked={numbering}
          disabled={disabled}
          onChange={onNumberingChange}
          label="Numerar as partes automaticamente"
        />
      </div>

      {/* Friendly heads-up that these options re-render frames (slower). */}
      {willReencode && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-bill-400/15 px-4 py-3 ring-1 ring-bill-400/40">
          <span className="text-lg" aria-hidden>
            🐢🦆
          </span>
          <p className="font-body text-xs text-bill-600">
            Com formato 9:16 ou numeração, o patinho precisa repintar cada
            quadro, então o corte fica mais demoradinho. Sem essas opções, o
            fatiamento é quase instantâneo!
          </p>
        </div>
      )}
    </div>
  );
}

function ModeOption({
  active,
  onClick,
  disabled,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border-2 px-3 py-2 text-left transition-all
        ${
          active
            ? "border-sky-500 bg-sky-200"
            : "border-duck-200 bg-white hover:border-sky-400"
        }
        disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span className="block font-display text-sm font-extrabold text-sky-500">
        {title}
      </span>
      <span className="block font-body text-[11px] text-duck-700/70">
        {subtitle}
      </span>
    </button>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`inline-flex h-8 w-14 shrink-0 items-center rounded-full px-1 transition-colors duration-200
        ${checked ? "bg-pond-500" : "bg-duck-200"}
        disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span
        className={`block h-6 w-6 rounded-full bg-white shadow transition-transform duration-200
          ${checked ? "translate-x-6" : "translate-x-0"}`}
      />
    </button>
  );
}
