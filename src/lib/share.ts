import type { VideoSegment } from "@/types";
import { canShareFiles } from "./environment";

export type SaveResult = "shared" | "downloaded" | "cancelled";

/** Trigger a plain browser download (desktop fallback). */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke a tick later so the download has time to start.
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Save a single segment using the best available mechanism:
 *  - Mobile (iOS/Android) with Web Share API + files -> native share sheet,
 *    where the user picks "Save Video" / "Save to gallery".
 *  - Otherwise -> regular download.
 */
export async function saveSegment(segment: VideoSegment): Promise<SaveResult> {
  const file = new File([segment.blob], segment.fileName, { type: "video/mp4" });

  if (canShareFiles()) {
    try {
      await navigator.share({
        files: [file],
        title: segment.fileName,
        text: `Parte ${segment.index} — I Love My Duck 🦆`,
      });
      return "shared";
    } catch (err) {
      // AbortError = user closed the sheet; not a real failure.
      if (err instanceof DOMException && err.name === "AbortError") {
        return "cancelled";
      }
      // Fall through to download on any other error.
    }
  }

  downloadBlob(segment.blob, segment.fileName);
  return "downloaded";
}

/**
 * Share many segments at once (mobile convenience). Not all platforms accept
 * multiple video files; we gracefully fall back to one-by-one saving.
 */
export async function shareAllSegments(segments: VideoSegment[]): Promise<SaveResult> {
  if (!canShareFiles()) return "downloaded";

  const files = segments.map(
    (s) => new File([s.blob], s.fileName, { type: "video/mp4" }),
  );

  if (typeof navigator.canShare === "function" && navigator.canShare({ files })) {
    try {
      await navigator.share({
        files,
        title: "I Love My Duck",
        text: "Meus patinhos prontos para os Stories 🦆",
      });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  return "downloaded";
}
