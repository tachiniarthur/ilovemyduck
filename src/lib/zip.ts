import JSZip from "jszip";
import type { VideoSegment } from "@/types";
import { downloadBlob } from "./share";

/** Bundle all segments into a single ZIP and download it (desktop convenience). */
export async function downloadAllAsZip(
  segments: VideoSegment[],
  onProgress?: (ratio: number) => void,
): Promise<void> {
  const zip = new JSZip();

  for (const segment of segments) {
    zip.file(segment.fileName, segment.blob);
  }

  const blob = await zip.generateAsync(
    {
      type: "blob",
      compression: "STORE", // videos are already compressed; STORE is fast.
    },
    (meta) => onProgress?.(meta.percent / 100),
  );

  downloadBlob(blob, "i-love-my-duck-todas-as-partes.zip");
}
