"use client";

import { useEffect, useState } from "react";
import type { VideoSegment } from "@/types";
import { canShareFiles, isIOS, isMobile } from "@/lib/environment";
import { shareAllSegments } from "@/lib/share";
import { downloadAllAsZip } from "@/lib/zip";
import SegmentCard from "./SegmentCard";
import Icon from "./Icon";
import DuckGlyph from "./brand/DuckGlyph";

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
      {/* Done banner, left-aligned, glyph as a small accent (no big mascot) */}
      <div className="card flex items-center gap-4 p-5 sm:p-6">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-pond-300/30 ring-1 ring-pond-400/30">
          <DuckGlyph size={48} />
        </span>
        <div>
          <h2 className="text-balance font-display text-2xl font-semibold leading-tight text-ink">
            Seus patinhos estão prontos! 🎉
          </h2>
          <p className="mt-1 text-pretty font-body text-sm leading-relaxed text-ink-muted">
            {segments.length}{" "}
            {segments.length === 1 ? "parte gerada" : "partes geradas"}, poste na
            ordem certinha (01, 02, 03…).
          </p>
        </div>
      </div>

      {/* Platform-specific saving tip */}
      <SaveTip mobile={env.mobile} ios={env.ios} canShare={env.canShare} />

      {/* Bulk actions */}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        {env.canShare && (
          <button
            type="button"
            onClick={handleShareAll}
            className="btn-success flex-1 px-4 py-3 text-sm"
          >
            <Icon name="stories" size={18} />
            Compartilhar todas as partes
          </button>
        )}

        <button
          type="button"
          onClick={handleZip}
          disabled={zipProgress !== null}
          className="btn-secondary flex-1 px-4 py-3 text-sm disabled:cursor-wait disabled:opacity-80"
        >
          <Icon name="download" size={18} />
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

      <div className="pt-2">
        <button
          type="button"
          onClick={onStartOver}
          className="btn-ghost px-1 py-2 text-sm"
        >
          ← Fatiar outro vídeo
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
      'Toque em "Salvar na galeria" e escolha "Salvar vídeo" na folha de compartilhamento, assim o patinho vai direto para o app Fotos. 🦆';
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
    <div className="flex items-start gap-3 rounded-card bg-sky-200/40 px-4 py-3.5 ring-1 ring-sky-300/40">
      <span className="mt-0.5 shrink-0 text-sky-700" aria-hidden>
        <Icon name="sparkle" size={18} />
      </span>
      <p className="text-pretty font-body text-sm font-medium leading-relaxed text-sky-700">
        {text}
      </p>
    </div>
  );
}
