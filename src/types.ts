export type SegmentDuration = 15 | 30 | 60;

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
