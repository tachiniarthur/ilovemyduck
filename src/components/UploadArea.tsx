"use client";

import { useCallback, useId, useRef, useState } from "react";
import DuckMascot from "./DuckMascot";

interface UploadAreaProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export default function UploadArea({ onFile, disabled }: UploadAreaProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [disabled, onFile],
  );

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          // Reset so re-selecting the same file fires change again.
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={pick}
        disabled={disabled}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        aria-label="Selecionar ou soltar um vídeo para fatiar"
        className={`group relative flex w-full flex-col items-center justify-center gap-5 rounded-5xl border-4 border-dashed px-6 py-14 text-center backdrop-blur-sm transition-[transform,border-color,background-color] duration-200 ease-[var(--ease-soft)] sm:py-20
          ${
            isDragging
              ? "scale-[1.01] border-bill-500 bg-duck-100"
              : "border-duck-300 bg-white/70 hover:-translate-y-0.5 hover:border-bill-400 hover:bg-duck-50 active:translate-y-0"
          }
          disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {/* floating bubbles */}
        <span className="pointer-events-none absolute left-8 top-10 h-3 w-3 rounded-full bg-sky-300/70 animate-bubble-up" />
        <span className="pointer-events-none absolute right-10 top-16 h-2 w-2 rounded-full bg-pond-300/70 animate-bubble-up [animation-delay:1s]" />

        <DuckMascot size={96} mood={isDragging ? "happy" : "waiting"} />

        <div className="space-y-1.5">
          <p className="font-display text-xl font-extrabold leading-tight tracking-tight text-bill-600 sm:text-2xl">
            {isDragging ? "Pode soltar! 🦆" : "Quack! Solta o vídeo aqui"}
          </p>
          <p className="font-body text-[0.95rem] leading-relaxed text-duck-700/80">
            Arraste e solte ou{" "}
            <span className="font-bold text-bill-600 underline decoration-wavy underline-offset-2">
              toque para escolher
            </span>
          </p>
          <p className="!mt-3 font-body text-xs font-medium tracking-wide text-duck-700/60">
            Aceita MP4, MOV e WebM · tudo fica no seu aparelho
          </p>
        </div>
      </button>
    </div>
  );
}
