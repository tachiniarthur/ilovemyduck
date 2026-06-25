"use client";

import { useCallback, useId, useRef, useState } from "react";
import Icon from "./Icon";

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
        className={`group flex w-full flex-col items-center justify-center gap-4 rounded-card border-2 border-dashed px-6 py-14 text-center transition-[border-color,background-color] duration-200 ease-[var(--ease-soft)] sm:py-20
          ${
            isDragging
              ? "border-bill-500 bg-bill-500/[0.05]"
              : "border-bark-300 bg-cream-50/70 hover:border-bill-400 hover:bg-cream-100"
          }
          disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span
          className={`grid h-14 w-14 place-items-center rounded-2xl transition-colors ${
            isDragging
              ? "bg-bill-600 text-white"
              : "bg-duck-100 text-bill-600 group-hover:bg-duck-200"
          }`}
        >
          <Icon name="upload" size={26} />
        </span>

        <div className="space-y-1.5">
          <p className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {isDragging ? "Pode soltar! 🦆" : "Solte o vídeo aqui"}
          </p>
          <p className="font-body text-base text-ink-muted">
            Arraste e solte ou{" "}
            <span className="font-semibold text-bill-700">toque para escolher</span>
          </p>
          <p className="!mt-3 font-mono text-xs tracking-wide text-bark-500">
            MP4 · MOV · WebM, tudo fica no seu aparelho
          </p>
        </div>
      </button>
    </div>
  );
}
