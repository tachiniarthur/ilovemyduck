"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AppPhase,
  LoadedVideo,
  SegmentDuration,
  VideoSegment,
} from "@/types";
import { isAcceptedVideo, loadVideoMetadata } from "@/lib/video";
import {
  FFmpegLoadError,
  ReencodeError,
  getRecentFFmpegLog,
  loadFFmpeg,
  sliceVideo,
} from "@/lib/ffmpeg";
import {
  isCrossOriginIsolated,
  isLikelyTooLargeForDevice,
  softSizeLimitLabel,
} from "@/lib/environment";
import { defaultCutTimes } from "@/lib/format";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import UploadArea from "@/components/UploadArea";
import VideoPreview from "@/components/VideoPreview";
import SegmentControls from "@/components/SegmentControls";
import ProcessingProgress from "@/components/ProcessingProgress";
import ResultsView from "@/components/ResultsView";
import Alert from "@/components/Alert";
import Icon from "@/components/Icon";

interface ErrorState {
  title: string;
  message: string;
  /** Real ffmpeg log tail / error text, surfaced for on-device debugging. */
  details?: string;
}

export default function FatiarPage() {
  const [phase, setPhase] = useState<AppPhase>("idle");
  const [video, setVideo] = useState<LoadedVideo | null>(null);
  const [segment, setSegment] = useState<SegmentDuration>(15);
  const [cutTimes, setCutTimes] = useState<number[]>([]);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [progress, setProgress] = useState({ ratio: 0, message: "" });
  const [error, setError] = useState<ErrorState | null>(null);
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
  const [notIsolated, setNotIsolated] = useState(false);

  // Keep references so we can revoke object URLs on reset/unmount.
  const videoRef = useRef<LoadedVideo | null>(null);
  const segmentsRef = useRef<VideoSegment[]>([]);
  videoRef.current = video;
  segmentsRef.current = segments;

  useEffect(() => {
    if (!isCrossOriginIsolated()) setNotIsolated(true);
  }, []);

  // Revoke any leftover object URLs when leaving the page.
  useEffect(() => {
    return () => {
      if (videoRef.current) URL.revokeObjectURL(videoRef.current.url);
      segmentsRef.current.forEach((s) => URL.revokeObjectURL(s.url));
    };
  }, []);

  const revokeSegments = useCallback(() => {
    segmentsRef.current.forEach((s) => URL.revokeObjectURL(s.url));
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setSizeWarning(null);

    if (!isAcceptedVideo(file)) {
      setError({
        title: "Esse arquivo não é um patinho 🦆",
        message:
          "Por enquanto eu só sei fatiar vídeos MP4, MOV ou WebM. Tenta de novo com um desses?",
      });
      return;
    }

    try {
      const loaded = await loadVideoMetadata(file);
      // Clean up a previously loaded video URL.
      if (videoRef.current) URL.revokeObjectURL(videoRef.current.url);

      setVideo(loaded);
      setSegments([]);
      setCutTimes(defaultCutTimes(loaded.duration, segment));
      setPhase("ready");

      if (isLikelyTooLargeForDevice(file.size)) {
        setSizeWarning(
          `Esse vídeo é bem grandinho para um celular (acima de ~${softSizeLimitLabel()}). ` +
            "Pode funcionar, mas se travar, tente um vídeo menor ou cortes maiores (60s).",
        );
      }
    } catch {
      setError({
        title: "Não consegui abrir esse vídeo 😢",
        message:
          "O arquivo pode estar corrompido ou em um formato que o navegador não entende. Tenta outro vídeo?",
      });
    }
  }, [segment]);

  // Changing the part size rebuilds a fresh uniform timeline (which the user
  // can then fine-tune by dragging the cut points).
  const handleSegmentChange = useCallback(
    (value: SegmentDuration) => {
      setSegment(value);
      if (videoRef.current) {
        setCutTimes(defaultCutTimes(videoRef.current.duration, value));
      }
    },
    [],
  );

  const handleReplace = useCallback(() => {
    if (videoRef.current) URL.revokeObjectURL(videoRef.current.url);
    revokeSegments();
    setVideo(null);
    setSegments([]);
    setCutTimes([]);
    setPhase("idle");
    setError(null);
    setSizeWarning(null);
  }, [revokeSegments]);

  const handleStartOver = useCallback(() => {
    handleReplace();
  }, [handleReplace]);

  const handleSlice = useCallback(async () => {
    if (!video) return;
    setError(null);
    // Clear out any previous run before we start appending new parts live.
    revokeSegments();
    setSegments([]);
    setPhase("processing");
    setProgress({ ratio: 0, message: "Acordando o patinho… 🦆" });

    try {
      // Warm up the engine first (no real progress to report yet).
      await loadFFmpeg();

      const sliceMessage = "Fatiando seu vídeo…";
      setProgress({ ratio: 0, message: sliceMessage });

      const result = await sliceVideo({
        file: video.file,
        cutTimes,
        totalDuration: video.duration,
        onProgress: (ratio) => setProgress({ ratio, message: sliceMessage }),
        // Parts appear as they finish, so progress feels real.
        onSegment: (seg) => setSegments((prev) => [...prev, seg]),
      });

      // onSegment already populated state; set the canonical list to be safe.
      setSegments(result);
      setPhase("done");
    } catch (err) {
      console.error("[slice] falha:", err);
      if (err instanceof ReencodeError) {
        // The console already has the real ffmpeg log tail attached here.
        console.error("[slice] log do FFmpeg:\n" + err.ffmpegLog);
      }
      const message = err instanceof Error ? err.message : "";
      const isLoadFailure = err instanceof FFmpegLoadError;
      const isReencode = err instanceof ReencodeError;
      const isMemory = /memory|allocat|abort|out of bounds|RangeError/i.test(
        message,
      );
      // Surface the real ffmpeg error on screen (collapsed), on iOS Safari the
      // dev console is out of reach, so this is the only way to see the actual
      // exit code / muxer message. ReencodeError carries its own log; everything
      // else (incl. the copy path) reads the engine's recent log tail.
      const ffmpegLog = isReencode
        ? (err as ReencodeError).ffmpegLog
        : getRecentFFmpegLog();
      const details =
        [
          message && `Erro: ${message}`,
          ffmpegLog && `FFmpeg:\n${ffmpegLog}`,
        ]
          .filter(Boolean)
          .join("\n\n") || undefined;
      const errorState: ErrorState =
        isLoadFailure
          ? {
              title: "O patinho não conseguiu acordar 🦆💤",
              message:
                "O motor de vídeo não carregou. Verifique sua conexão e tente de novo, se persistir, recarregue a página.",
            }
          : isMemory
            ? {
                title: "O patinho ficou sem fôlego 😵‍💫",
                message:
                  "Esse vídeo foi pesado demais para a memória do navegador. Tente um vídeo menor, cortes maiores (60s), ou faça pelo computador.",
              }
            : {
                title: "Algo deu errado no fatiamento 🦆",
                message:
                  "Não consegui finalizar o corte. Tente novamente, se persistir, use um vídeo menor ou recarregue a página.",
              };
      setError({ ...errorState, details });
      // Throw away any parts produced before the failure.
      revokeSegments();
      setSegments([]);
      setPhase("ready");
    }
  }, [video, cutTimes, revokeSegments]);

  const partsCount = cutTimes.length + 1;
  const isProcessing = phase === "processing";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container-page w-full max-w-3xl flex-1 pt-10 sm:pt-14">
        <ToolIntro />

        {/* Cross-origin isolation warning (FFmpeg won't run without it) */}
        {notIsolated && (
          <div className="mb-4">
            <Alert
              tone="warning"
              title="Modo seguro do patinho desativado"
              message="Os cabeçalhos de isolamento (COOP/COEP) não estão ativos, então o fatiador pode não carregar. Se você está rodando localmente, reinicie o servidor após configurar o next.config."
            />
          </div>
        )}

        {error && (
          <div className="mb-4">
            <Alert
              title={error.title}
              message={error.message}
              details={error.details}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* IDLE, upload */}
        {phase === "idle" && <UploadArea onFile={handleFile} />}

        {/* READY, preview + controls */}
        {phase === "ready" && video && (
          <div className="space-y-5">
            <VideoPreview video={video} onReplace={handleReplace} />

            {sizeWarning && (
              <Alert
                tone="warning"
                title="Vídeo grandinho 🦆"
                message={sizeWarning}
                onDismiss={() => setSizeWarning(null)}
              />
            )}

            <SegmentControls
              duration={video.duration}
              segment={segment}
              onSegmentChange={handleSegmentChange}
              cutTimes={cutTimes}
              onCutTimesChange={setCutTimes}
            />

            <button
              type="button"
              onClick={handleSlice}
              className="btn-primary w-full px-6 py-4 text-lg"
            >
              <Icon name="scissors" size={20} />
              Fatiar em {partsCount} {partsCount === 1 ? "parte" : "partes"}
            </button>
          </div>
        )}

        {/* PROCESSING */}
        {isProcessing && (
          <div className="space-y-5">
            <ProcessingProgress ratio={progress.ratio} message={progress.message} />
            {segments.length > 0 && <LiveParts segments={segments} />}
          </div>
        )}

        {/* DONE, results */}
        {phase === "done" && segments.length > 0 && (
          <ResultsView segments={segments} onStartOver={handleStartOver} />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

/** Parts that have finished while the rest are still processing. */
function LiveParts({ segments }: { segments: VideoSegment[] }) {
  return (
    <div className="card p-5 sm:p-6">
      <p className="mb-4 flex items-center gap-2 font-body text-sm font-semibold text-pond-700">
        <Icon name="check" size={16} />
        {segments.length} {segments.length === 1 ? "parte já saiu" : "partes já saíram"} do
        forno
      </p>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {segments.map((segment) => (
          <div
            key={segment.index}
            className="relative animate-pop-in overflow-hidden rounded-xl bg-ink ring-1 ring-bark-200"
          >
            <video
              src={segment.url}
              muted
              playsInline
              preload="metadata"
              className="aspect-video w-full bg-ink object-contain"
            />
            <span className="absolute left-1.5 top-1.5 rounded-md bg-bill-600 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white">
              {String(segment.index).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Left-aligned tool header, no giant centred mascot. */
function ToolIntro() {
  return (
    <div className="mb-8 max-w-xl">
      <p className="eyebrow">
        <span className="slice-line h-px w-6" />
        Fatiador
      </p>
      <h1 className="mt-3 text-balance font-display text-display-lg font-semibold text-ink">
        Solte um vídeo e deixe o patinho{" "}
        <span className="italic text-bill-600">fatiar</span>
      </h1>
      <p className="mt-3 text-pretty font-body leading-relaxed text-ink-muted">
        Ele vira várias partes prontas para postar em sequência nos Stories. Tudo
        acontece aqui no navegador, nada é enviado para servidor nenhum.
      </p>
    </div>
  );
}
