"use client";

import type { LoadedVideo } from "@/types";
import { formatBytes, formatDuration } from "@/lib/format";
import Icon from "./Icon";

interface VideoPreviewProps {
  video: LoadedVideo;
  onReplace: () => void;
}

export default function VideoPreview({ video, onReplace }: VideoPreviewProps) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="overflow-hidden rounded-xl bg-ink ring-1 ring-black/5">
        <video
          src={video.url}
          controls
          playsInline
          preload="metadata"
          className="mx-auto max-h-[55vh] w-full bg-ink object-contain"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <Badge>
            <Icon name="clock" size={13} />
            {formatDuration(video.duration)}
          </Badge>
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
          className="btn-ghost px-2 py-1 text-xs"
        >
          Trocar vídeo
        </button>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-200 px-2.5 py-1 font-medium text-ink-soft ring-1 ring-bark-200">
      {children}
    </span>
  );
}
