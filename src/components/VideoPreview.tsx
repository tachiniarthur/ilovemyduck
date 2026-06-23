"use client";

import type { LoadedVideo } from "@/types";
import { formatBytes, formatDuration } from "@/lib/format";

interface VideoPreviewProps {
  video: LoadedVideo;
  onReplace: () => void;
}

export default function VideoPreview({ video, onReplace }: VideoPreviewProps) {
  return (
    <div className="duck-card">
      <div className="overflow-hidden rounded-3xl bg-black ring-1 ring-black/5">
        <video
          src={video.url}
          controls
          playsInline
          preload="metadata"
          className="mx-auto max-h-[55vh] w-full bg-black object-contain"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
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
          className="btn-ghost rounded-full px-3 py-1.5 text-xs font-bold underline-offset-2"
        >
          Trocar vídeo
        </button>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-duck-100 px-2.5 py-1 font-semibold tracking-wide text-duck-700 ring-1 ring-duck-200/70">
      {children}
    </span>
  );
}
