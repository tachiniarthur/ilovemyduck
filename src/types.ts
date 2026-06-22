export type SegmentDuration = 15 | 30 | 60;

// Stories framing for non-9:16 videos:
//  - "off"   : keep the original aspect ratio (fast copy stays available)
//  - "fill"  : scale to cover 1080x1920 and crop the overflow
//  - "blur"  : fit inside 1080x1920 over a blurred copy of the video
//  - "color" : fit inside 1080x1920 over a solid duck-sky background
export type VerticalMode = "off" | "fill" | "blur" | "color";

// Editing options that force the (slower) re-encode path.
export interface SliceFeatures {
  vertical: VerticalMode;
  numbering: boolean;
}

/** True when the chosen options can no longer be done with a stream copy. */
export function needsReencode(features: SliceFeatures): boolean {
  return features.vertical !== "off" || features.numbering;
}

export interface LoadedVideo {
  file: File;
  url: string; // object URL for preview
  duration: number; // seconds
  width: number;
  height: number;
}

export interface VideoSegment {
  index: number; // 1-based part number
  fileName: string; // e.g. i-love-my-duck-parte-01.mp4
  blob: Blob;
  url: string; // object URL for preview / download
  startTime: number; // seconds into the original video
  duration: number; // seconds of this segment
}

export type AppPhase = "idle" | "ready" | "processing" | "done" | "error";

export interface ProcessProgress {
  ratio: number; // 0..1
  message: string;
}
