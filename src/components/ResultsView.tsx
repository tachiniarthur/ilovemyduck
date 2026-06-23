"use client";

import { useEffect, useState } from "react";
import type { VideoSegment } from "@/types";
import { canShareFiles, isIOS, isMobile } from "@/lib/environment";
import { shareAllSegments } from "@/lib/share";
import { downloadAllAsZip } from "@/lib/zip";
import DuckMascot from "./DuckMascot";
import SegmentCard from "./SegmentCard";

interface ResultsViewProps {
  segments: VideoSegment[];
  onStartOver: () => void;
}

export default function ResultsView({ segments, onStartOver }: ResultsViewProps) {
  // Detect environment on the client only (avoids SSR/hydration mismatch).
  const [env, setEnv] = useState({ mobile: false, ios: false, canShare: false });
  const [zipProgress, setZipProgress] = useState<number | null>(null);

  useEffect(() => {
    setEnv({ mobile: isMobile(), ios: isIOS(), canShare: canShareFiles() });
  }, []);

  const saveMode: "share" | "download" = env.canShare ? "share" : "download";

  const handleZip = async () => {
    setZipProgress(0);
    try {
      await downloadAllAsZip(segments, (r) => setZipProgress(r));
    } finally {
      setZipProgress(null);
    }
  };

  const handleShareAll = async () => {
    await shareAllSegments(segments);
  };

  return (
    <div className="space-y-5">
      {/* Celebration banner */}
      <div className="rounded-4xl bg-gradient-to-br from-duck-100 to-pond-300/40 p-6 text-center shadow-soft ring-1 ring-duck-200">
        <DuckMascot size={88} mood="celebrating" className="mx-auto" />
        <h2 className="mt-2 text-balance font-display text-2xl font-extrabold tracking-tight text-bill-600">
          Seus patinhos estão prontos! 🎉
        </h2>
        <p className="text-pretty font-body text-sm text-duck-700/80">
          {segments.length} {segments.length === 1 ? "parte gerada" : "partes geradas"} — é
          só postar na ordem certinha (parte 01, 02, 03…).
        </p>
      </div>

      {/* Platform-specific saving tip */}
      <SaveTip mobile={env.mobile} ios={env.ios} canShare={env.canShare} />

      {/* Bulk actions */}
      <div className="flex flex-col gap-2 sm:flex-row">
        {env.canShare && (
          <button
            type="button"
            onClick={handleShareAll}
            className="flex-1 rounded-2xl bg-pond-500 px-4 py-3 font-display text-sm font-extrabold text-white shadow-pop transition-all hover:-translate-y-0.5 hover:bg-pond-400 active:translate-y-0.5 active:shadow-none"
          >
            Compartilhar todas as partes 🦆
          </button>
        )}

        <button
          type="button"
          onClick={handleZip}
          disabled={zipProgress !== null}
          className="flex-1 rounded-2xl bg-sky-500 px-4 py-3 font-display text-sm font-extrabold text-white shadow transition-all hover:-translate-y-0.5 hover:bg-sky-400 active:translate-y-0.5 disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-y-0"
        >
          {zipProgress !== null
            ? `Empacotando… ${Math.round(zipProgress * 100)}%`
            : "Baixar tudo em ZIP"}
        </button>
      </div>

      {/* Segment grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {segments.map((segment) => (
          <SegmentCard key={segment.index} segment={segment} saveMode={saveMode} />
        ))}
      </div>

      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onStartOver}
          className="rounded-full px-5 py-2.5 font-display text-sm font-extrabold text-bill-600 underline decoration-wavy underline-offset-4 hover:text-bill-500"
        >
          Fatiar outro vídeo
        </button>
      </div>
    </div>
  );
}

function SaveTip({
  mobile,
  ios,
  canShare,
}: {
  mobile: boolean;
  ios: boolean;
  canShare: boolean;
}) {
  let text: string;
  if (canShare && ios) {
    text =
      'Toque em "Salvar na galeria" e escolha "Salvar vídeo" na folha de compartilhamento — assim o patinho vai direto para o app Fotos. 🦆';
  } else if (canShare && mobile) {
    text =
      'Toque em "Salvar na galeria" e escolha "Salvar na galeria" (ou Fotos/Google Fotos) na folha que abrir, para o patinho ir parar na sua galeria. 🦆';
  } else if (canShare) {
    text =
      'Ao salvar, escolha "Salvar vídeo" na folha de compartilhamento para guardar o patinho. 🦆';
  } else {
    text =
      "No computador cada parte é baixada como arquivo. Dica: use o botão ZIP para baixar todas de uma vez! 🦆";
  }

  return (
    <div className="flex items-start gap-3 rounded-3xl bg-sky-200/60 px-4 py-3 ring-1 ring-sky-300/50">
      <span className="text-lg" aria-hidden>
        💡
      </span>
      <p className="text-pretty font-body text-sm font-semibold text-sky-700">{text}</p>
    </div>
  );
}
