"use client";

import type { LoadedVideo } from "@/types";
import { formatBytes, formatDuration } from "@/lib/format";

interface VideoPreviewProps {
  video: LoadedVideo;
  onReplace: () => void;
}

export default function VideoPreview({ video, onReplace }: VideoPreviewProps) {
  return (
    <div className="rounded-4xl bg-white/80 p-4 shadow-soft ring-1 ring-duck-200">
      <div className="overflow-hidden rounded-3xl bg-black">
        <video
          src={video.url}
          controls
          playsInline
          preload="metadata"
          className="mx-auto max-h-[55vh] w-full bg-black object-contain"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap items-center gap-2 font-body text-xs">
          <Badge>⏱ {formatDuration(video.duration)}</Badge>
          {video.width > 0 && (
            <Badge>
              {video.width}×{video.height}
            </Badge>
          )}
          <Badge>{formatBytes(video.file.size)}</Badge>
        </div>

        <button
          type="button"
          onClick={onReplace}
          className="rounded-full px-3 py-1.5 font-body text-xs font-bold text-bill-600 underline decoration-wavy underline-offset-2 hover:text-bill-500"
        >
          Trocar vídeo
        </button>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-duck-100 px-2.5 py-1 font-semibold text-duck-700">
      {children}
    </span>
  );
}
