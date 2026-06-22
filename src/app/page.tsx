"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AppPhase,
  LoadedVideo,
  SegmentDuration,
  VerticalMode,
  VideoSegment,
} from "@/types";
import { isAcceptedVideo, loadVideoMetadata } from "@/lib/video";
import {
  FFmpegLoadError,
  ReencodeError,
  loadFFmpeg,
  sliceVideo,
} from "@/lib/ffmpeg";
import {
  isCrossOriginIsolated,
  isLikelyTooLargeForDevice,
  softSizeLimitLabel,
} from "@/lib/environment";
import { defaultCutTimes } from "@/lib/format";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UploadArea from "@/components/UploadArea";
import VideoPreview from "@/components/VideoPreview";
import SegmentControls from "@/components/SegmentControls";
import ProcessingProgress from "@/components/ProcessingProgress";
import ResultsView from "@/components/ResultsView";
import Alert from "@/components/Alert";
import DuckMascot from "@/components/DuckMascot";

interface ErrorState {
  title: string;
  message: string;
}

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("idle");
  const [video, setVideo] = useState<LoadedVideo | null>(null);
  const [segment, setSegment] = useState<SegmentDuration>(15);
  const [vertical, setVertical] = useState<VerticalMode>("off");
  const [numbering, setNumbering] = useState(false);
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
    const willReencode = vertical !== "off" || numbering;
    setError(null);
    // Clear out any previous run before we start appending new parts live.
    revokeSegments();
    setSegments([]);
    setPhase("processing");
    setProgress({ ratio: 0, message: "Acordando o patinho… 🦆" });

    try {
      // Warm up the engine first (no real progress to report yet).
      await loadFFmpeg();

      const sliceMessage = willReencode
        ? "Reenquadrando e fatiando…"
        : "Fatiando seu vídeo…";
      setProgress({ ratio: 0, message: sliceMessage });

      const result = await sliceVideo({
        file: video.file,
        cutTimes,
        totalDuration: video.duration,
        features: { vertical, numbering },
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
      setError(
        isLoadFailure
          ? {
              title: "O patinho não conseguiu acordar 🦆💤",
              message:
                "O motor de vídeo não carregou. Verifique sua conexão e tente de novo — se persistir, recarregue a página.",
            }
          : isReencode
            ? {
                title: "O patinho cansou de reenquadrar 🦆🪄",
                message:
                  "O formato Stories (9:16) precisa redesenhar cada quadro, e isso ficou pesado demais para este navegador. " +
                  "Tente cortes mais curtos (15s), um vídeo menor, ou desligue o 9:16 e use o corte simples (rapidíssimo). " +
                  "No computador costuma voar.",
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
                    "Não consegui finalizar o corte. Tente novamente — se persistir, use um vídeo menor ou recarregue a página.",
                },
      );
      // Throw away any parts produced before the failure.
      revokeSegments();
      setSegments([]);
      setPhase("ready");
    }
  }, [video, cutTimes, vertical, numbering, revokeSegments]);

  const partsCount = cutTimes.length + 1;
  const isProcessing = phase === "processing";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6">
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
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* IDLE — upload */}
        {phase === "idle" && (
          <div className="space-y-6">
            <Intro />
            <UploadArea onFile={handleFile} />
          </div>
        )}

        {/* READY — preview + controls */}
        {phase === "ready" && video && (
          <div className="space-y-4">
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
              videoUrl={video.url}
              segment={segment}
              onSegmentChange={handleSegmentChange}
              vertical={vertical}
              onVerticalChange={setVertical}
              numbering={numbering}
              onNumberingChange={setNumbering}
              cutTimes={cutTimes}
              onCutTimesChange={setCutTimes}
            />

            <button
              type="button"
              onClick={handleSlice}
              className="w-full rounded-3xl bg-bill-500 px-6 py-4 font-display text-xl font-extrabold text-white shadow-soft-lg transition-all hover:bg-bill-400 active:translate-y-0.5 active:shadow-soft"
            >
              Fatiar em {partsCount} {partsCount === 1 ? "parte" : "partes"} 🔪🦆
            </button>
          </div>
        )}

        {/* PROCESSING */}
        {isProcessing && (
          <div className="space-y-4">
            <ProcessingProgress ratio={progress.ratio} message={progress.message} />
            {segments.length > 0 && <LiveParts segments={segments} />}
          </div>
        )}

        {/* DONE — results */}
        {phase === "done" && segments.length > 0 && (
          <ResultsView segments={segments} onStartOver={handleStartOver} />
        )}
      </main>

      <Footer />
    </div>
  );
}

/** Parts that have finished while the rest are still processing. */
function LiveParts({ segments }: { segments: VideoSegment[] }) {
  return (
    <div className="rounded-4xl bg-white/80 p-4 shadow-soft ring-1 ring-duck-200">
      <p className="mb-3 text-center font-display text-sm font-extrabold text-pond-600">
        {segments.length} {segments.length === 1 ? "parte já saiu" : "partes já saíram"}{" "}
        do forno 🦆✨
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {segments.map((segment) => (
          <div
            key={segment.index}
            className="relative animate-pop-in overflow-hidden rounded-2xl bg-black ring-1 ring-duck-200"
          >
            <video
              src={segment.url}
              muted
              playsInline
              preload="metadata"
              className="aspect-[9/16] w-full bg-black object-contain"
            />
            <span className="absolute left-1.5 top-1.5 rounded-full bg-bill-500 px-2 py-0.5 font-display text-[10px] font-extrabold text-white shadow">
              {String(segment.index).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Intro() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-2 inline-flex">
        <DuckMascot size={72} mood="happy" />
      </div>
      <h2 className="font-display text-2xl font-extrabold text-bill-600 sm:text-3xl">
        Vídeo longo? Deixa que o patinho fatia! 🦆
      </h2>
      <p className="mx-auto mt-2 max-w-md font-body text-sm text-duck-700/80 sm:text-base">
        Solte um vídeo e ele vira várias partes prontinhas para postar em
        sequência nos seus Stories. Sem editor complicado, sem enviar nada para
        servidor nenhum.
      </p>
    </div>
  );
}
