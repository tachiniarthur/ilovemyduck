import type { LoadedVideo } from "@/types";

export const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
export const ACCEPTED_EXTENSIONS = [".mp4", ".mov", ".webm"];

export function isAcceptedVideo(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  // Some browsers leave file.type empty for .mov — fall back to extension.
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

/**
 * Read duration and dimensions from a video File by loading its metadata into
 * a hidden <video> element. Resolves with an object URL kept for previewing.
 */
export function loadVideoMetadata(file: File): Promise<LoadedVideo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;

    const cleanup = () => {
      video.onloadedmetadata = null;
      video.onerror = null;
    };

    video.onloadedmetadata = () => {
      cleanup();
      const duration = video.duration;
      if (!isFinite(duration) || duration <= 0) {
        URL.revokeObjectURL(url);
        reject(new Error("Não consegui ler a duração do vídeo."));
        return;
      }
      resolve({
        file,
        url,
        duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };

    video.onerror = () => {
      cleanup();
      URL.revokeObjectURL(url);
      reject(new Error("Não consegui abrir esse vídeo."));
    };

    video.src = url;
  });
}
