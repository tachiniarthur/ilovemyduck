// Small helpers to adapt the saving/sharing experience per device.
// All guarded for SSR (return safe defaults on the server).

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof navigator !== "undefined";
}

export function isIOS(): boolean {
  if (!isBrowser()) return false;
  const ua = navigator.userAgent;
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ reports as Mac but has touch support.
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOS;
}

export function isAndroid(): boolean {
  if (!isBrowser()) return false;
  return /Android/i.test(navigator.userAgent);
}

export function isMobile(): boolean {
  if (!isBrowser()) return false;
  return isIOS() || isAndroid() || /Mobi/i.test(navigator.userAgent);
}

/** Whether the device can share actual files via the Web Share API. */
export function canShareFiles(): boolean {
  if (!isBrowser()) return false;
  if (!("share" in navigator) || !("canShare" in navigator)) return false;
  try {
    const probe = new File(["duck"], "duck.txt", { type: "text/plain" });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

/** Cross-origin isolation is required for SharedArrayBuffer / FFmpeg.wasm. */
export function isCrossOriginIsolated(): boolean {
  if (!isBrowser()) return false;
  return Boolean((window as unknown as { crossOriginIsolated?: boolean }).crossOriginIsolated);
}

/**
 * Rough guidance: on memory-constrained mobile browsers (especially iOS Safari)
 * very large videos can crash the tab. We warn above a soft threshold.
 */
export function isLikelyTooLargeForDevice(bytes: number): boolean {
  const mb = bytes / (1024 * 1024);
  if (isIOS()) return mb > 250;
  if (isMobile()) return mb > 500;
  return mb > 2048;
}

export function softSizeLimitLabel(): string {
  if (isIOS()) return "250 MB";
  if (isMobile()) return "500 MB";
  return "2 GB";
}
