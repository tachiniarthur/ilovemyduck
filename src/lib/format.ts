import type { SegmentDuration } from "@/types";

/** Format seconds as m:ss (or h:mm:ss for long videos). */
export function formatDuration(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor(totalSeconds / 3600);

  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) {
    const mm = String(minutes).padStart(2, "0");
    return `${hours}:${mm}:${ss}`;
  }
  return `${minutes}:${ss}`;
}

/** Human-readable file size. */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

/** How many parts a video of `duration` seconds becomes at `segment` length. */
export function countSegments(duration: number, segment: SegmentDuration): number {
  if (!isFinite(duration) || duration <= 0) return 0;
  return Math.max(1, Math.ceil(duration - 0.001 < segment ? 1 : duration / segment));
}

/** Zero-padded part file name, e.g. i-love-my-duck-parte-03.mp4 */
export function partFileName(index: number): string {
  return `i-love-my-duck-parte-${String(index).padStart(2, "0")}.mp4`;
}

/** Friendly "X partes de até Ns" sentence. */
export function partsSentence(duration: number, segment: SegmentDuration): string {
  const parts = countSegments(duration, segment);
  if (parts <= 0) return "";
  const partWord = parts === 1 ? "parte" : "partes";
  return `Seu vídeo virará ${parts} ${partWord} de até ${segment}s`;
}

/**
 * Internal cut points (exclusive of 0 and the end) for a uniform split, the
 * starting layout the user can then fine-tune on the timeline.
 */
export function defaultCutTimes(duration: number, segment: SegmentDuration): number[] {
  const times: number[] = [];
  if (!isFinite(duration) || duration <= 0) return times;
  // Leave a small tail so we never create a sliver final part.
  for (let t = segment; t < duration - 0.25; t += segment) {
    times.push(Math.round(t * 100) / 100);
  }
  return times;
}

export interface SegmentMeta {
  index: number; // 1-based
  start: number;
  end: number;
  duration: number;
}

/** Turn internal cut points into ordered {start,end,duration} segment metadata. */
export function segmentsMeta(cutTimes: number[], duration: number): SegmentMeta[] {
  const bounds = [0, ...[...cutTimes].sort((a, b) => a - b), duration];
  const metas: SegmentMeta[] = [];
  for (let i = 0; i < bounds.length - 1; i++) {
    const start = bounds[i];
    const end = bounds[i + 1];
    metas.push({ index: i + 1, start, end, duration: Math.max(0, end - start) });
  }
  return metas;
}
