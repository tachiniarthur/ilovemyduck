import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import type { SliceFeatures, VerticalMode, VideoSegment } from "@/types";
import { needsReencode } from "@/types";
import { partFileName, segmentsMeta } from "./format";
import { buildPartBadge } from "./badge";

// Single-threaded core. We deliberately do NOT use @ffmpeg/core-mt here:
//   - The default slicing path is a pure stream copy, which is already near
//     instant on the single-thread core — multi-threading buys nothing there.
//   - The MT core spawns a pool of pthread workers during load. When that pool
//     fails to initialize the FFmpeg class never receives a "load" message back
//     and never rejects either (it has no onerror/timeout), so the UI hangs at
//     0% forever with no error. The ST core has no such pool, so load either
//     succeeds or fails cleanly.
//   - The ST core also doesn't require SharedArrayBuffer, so it still works even
//     if cross-origin isolation is somehow lost.
// Note: the ST core ships only ffmpeg-core.js + ffmpeg-core.wasm (NO
// ffmpeg-core.worker.js), so we must not pass a workerURL to load().
const CORE_VERSION = "0.12.6";
const CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

// Hard ceiling for the whole load (download + core init). If we blow past this
// we abort and surface a friendly error instead of leaving the bar stuck at 0%.
const LOAD_TIMEOUT_MS = 90_000;

let ffmpeg: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

export type ProgressHandler = (ratio: number) => void;
export type LogHandler = (message: string) => void;

// --- FFmpeg log capture --------------------------------------------------
// The single-thread core writes everything (including the *real* error that
// ffmpeg hits) to its log callback. We keep a small ring buffer of the most
// recent lines so that, when a re-encode fails, we can surface the actual
// ffmpeg message instead of failing silently. Every line is also mirrored to
// the console so the failure is visible during development.
const LOG_RING_SIZE = 50;
const recentLogs: string[] = [];
let currentLogHandler: LogHandler | undefined;

function pushLog(message: string): void {
  recentLogs.push(message);
  if (recentLogs.length > LOG_RING_SIZE) recentLogs.shift();
  console.debug("[ffmpeg]", message);
  currentLogHandler?.(message);
}

/** The last few ffmpeg log lines, for attaching to error messages. */
function recentLogTail(lines = 14): string {
  return recentLogs.slice(-lines).join("\n");
}

/**
 * The tail of the most recent ffmpeg log lines, for surfacing the *real* engine
 * error in the UI. Used by the copy path (and any failure that doesn't carry its
 * own log), so that — even on iOS Safari, where the dev console is out of reach —
 * the actual ffmpeg message is visible on screen.
 */
export function getRecentFFmpegLog(lines = 14): string {
  return recentLogTail(lines);
}

/** Thrown when the FFmpeg engine itself fails to load (vs. a slicing failure). */
export class FFmpegLoadError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "FFmpegLoadError";
  }
}

/** Thrown when a 9:16 re-encode part fails (bad command, OOM, codec, etc.). */
export class ReencodeError extends Error {
  /** Tail of the real ffmpeg log, for the console / bug reports. */
  readonly ffmpegLog: string;
  constructor(message: string, ffmpegLog: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ReencodeError";
    this.ffmpegLog = ffmpegLog;
  }
}

/** Thrown when a single re-encode part blows past its time budget. */
export class ReencodeTimeoutError extends ReencodeError {
  constructor(message: string, ffmpegLog: string) {
    super(message, ffmpegLog);
    this.name = "ReencodeTimeoutError";
  }
}

/**
 * Lazily create and load the FFmpeg instance exactly once, reusing it across
 * every operation. Loading the core/wasm via toBlobURL sidesteps the COEP
 * "require-corp" restriction by turning the cross-origin assets into
 * same-origin blob URLs.
 *
 * Crucially, the load is bounded by a timeout + AbortSignal: the underlying
 * FFmpeg.load() can hang indefinitely if the worker dies during init, so we
 * guarantee the returned promise always settles.
 */
export async function loadFFmpeg(onLog?: LogHandler): Promise<FFmpeg> {
  // Route this call's log handler to the (single) persistent listener below.
  currentLogHandler = onLog;
  if (ffmpeg) return ffmpeg;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const instance = new FFmpeg();
    // Registered once for the lifetime of the instance: capture every line into
    // the ring buffer (and forward to whoever set currentLogHandler).
    instance.on("log", ({ message }) => {
      pushLog(message);
    });

    // Abort the underlying load() if it stalls, so #send's promise rejects
    // instead of hanging forever.
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(
          new FFmpegLoadError(
            `Tempo esgotado ao carregar o motor de vídeo (>${LOAD_TIMEOUT_MS / 1000}s).`,
          ),
        );
      }, LOAD_TIMEOUT_MS);
    });

    const work = (async () => {
      console.info("[ffmpeg] carregando core single-thread…", CORE_BASE_URL);
      const [coreURL, wasmURL] = await Promise.all([
        toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
        toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
      ]);
      // No workerURL: the single-thread core has no ffmpeg-core.worker.js.
      await instance.load({ coreURL, wasmURL }, { signal: controller.signal });
      console.info("[ffmpeg] core carregado com sucesso.");
      return instance;
    })();

    try {
      ffmpeg = await Promise.race([work, timeout]);
      return ffmpeg;
    } catch (err) {
      console.error("[ffmpeg] falha ao carregar o core:", err);
      if (err instanceof FFmpegLoadError) throw err;
      throw new FFmpegLoadError("Não consegui carregar o motor de vídeo.", {
        cause: err,
      });
    } finally {
      clearTimeout(timer);
    }
  })();

  try {
    return await loadPromise;
  } catch (err) {
    // Allow a retry on the next call if loading failed.
    loadPromise = null;
    throw err;
  }
}

export interface SliceOptions {
  file: File;
  /** Internal cut points (exclusive of 0 and total). Empty = single part. */
  cutTimes: number[];
  totalDuration: number;
  features: SliceFeatures;
  onProgress?: ProgressHandler;
  /** Called as each part becomes ready, for progressive UI. */
  onSegment?: (segment: VideoSegment) => void;
  onLog?: LogHandler;
}

/**
 * Slice a video into sequential parts.
 *
 * Fast path (default): a pure stream COPY through the segment muxer. No frames
 * are re-encoded, so even a 10-minute video splits in a couple of seconds. The
 * muxer cuts on the nearest keyframe, so each part already starts on a valid
 * frame (no black intro) — at the cost of the boundary landing a little off the
 * exact requested time, which is irrelevant for Stories.
 *
 * Slow path: only taken when the user enables 9:16 framing or part numbering,
 * which require re-rendering frames. We then re-encode each part individually
 * (fast x264 preset) so we can stamp a per-part badge and reframe to 720x1280.
 */
export async function sliceVideo(options: SliceOptions): Promise<VideoSegment[]> {
  const instance = await loadFFmpeg(options.onLog);
  if (needsReencode(options.features)) {
    return reencodeSlices(instance, options);
  }
  return copySlices(instance, options);
}

// ---------------------------------------------------------------------------
// Fast path — stream copy via the segment muxer.
// ---------------------------------------------------------------------------

async function copySlices(
  instance: FFmpeg,
  { file, cutTimes, totalDuration, onProgress, onSegment }: SliceOptions,
): Promise<VideoSegment[]> {
  const inputName = "input" + getExtension(file.name);
  const outputPattern = "part_%03d.mp4";

  const progressListener = ({ progress }: { progress: number }) => {
    onProgress?.(clamp01(progress));
  };
  instance.on("progress", progressListener);

  try {
    await instance.writeFile(inputName, await fetchFile(file));

    const sorted = [...cutTimes].sort((a, b) => a - b);

    // Map only the first video + (optional) audio track. iPhone .mov captures
    // carry extra timed-metadata/data tracks that "-map 0" would also select;
    // the MP4 segment muxer can't write those and fails the whole copy with a
    // non-zero exit code. Selecting v+a keeps the output identical for normal
    // videos while dropping the tracks that break muxing.
    let code: number;
    if (sorted.length === 0) {
      // Single part — just copy the whole thing.
      console.info("[ffmpeg] copy (parte única)");
      code = await instance.exec([
        "-i", inputName,
        "-c", "copy",
        "-map", "0:v:0",
        "-map", "0:a?",
        "part_000.mp4",
      ]);
    } else {
      console.info("[ffmpeg] copy via segment muxer; cortes:", sorted);
      code = await instance.exec([
        "-i", inputName,
        "-c", "copy",
        "-map", "0:v:0",
        "-map", "0:a?",
        "-f", "segment",
        "-segment_times", sorted.join(","),
        "-reset_timestamps", "1",
        outputPattern,
      ]);
    }

    // exec() returns ffmpeg's exit code; non-zero means the command failed.
    if (code !== 0) {
      throw new Error(`FFmpeg terminou com código ${code} ao fatiar o vídeo.`);
    }

    return await collectSegments(instance, cutTimes, totalDuration, onSegment);
  } finally {
    instance.off("progress", progressListener);
    await safeDelete(instance, inputName);
  }
}

/** Read every produced part_XXX.mp4 back out of the in-memory FS. */
async function collectSegments(
  instance: FFmpeg,
  cutTimes: number[],
  totalDuration: number,
  onSegment?: (segment: VideoSegment) => void,
): Promise<VideoSegment[]> {
  const entries = await instance.listDir(".");
  const partNames = entries
    .filter((e) => !e.isDir && /^part_\d{3}\.mp4$/.test(e.name))
    .map((e) => e.name)
    .sort();

  console.info("[ffmpeg] partes geradas:", partNames);
  if (partNames.length === 0) {
    throw new Error(
      "Nenhum segmento foi gerado — o muxer não produziu nenhum arquivo de saída.",
    );
  }

  const metas = segmentsMeta(cutTimes, totalDuration);
  const segments: VideoSegment[] = [];

  for (let i = 0; i < partNames.length; i++) {
    const meta = metas[i];
    const segment = await readSegment(instance, partNames[i], i + 1, {
      start: meta?.start ?? 0,
      duration: meta?.duration ?? 0,
    });
    segments.push(segment);
    onSegment?.(segment);
    await safeDelete(instance, partNames[i]);
  }

  return segments;
}

// ---------------------------------------------------------------------------
// Slow path — per-part re-encode (9:16 framing and/or numbering).
// ---------------------------------------------------------------------------

// Re-encoding 720x1280 with the single-thread libx264 is sub-realtime, so a
// part legitimately takes a while — especially on phones. We never wait forever
// though: the core's own timeout aborts a runaway encode (returning a non-zero
// code), which we turn into a friendly error instead of an eternal 0% bar.
// Budget scales with the part length, with a floor for very short parts.
const REENCODE_MS_PER_SECOND = 20_000; // 20s of wall-clock allowed per video second
const REENCODE_MIN_TIMEOUT_MS = 90_000;
// The JS-side watchdog is a backstop for a fully wedged worker that never posts
// back at all: it fires a bit after the core timeout should have already won.
const WATCHDOG_GRACE_MS = 20_000;

function partTimeoutMs(durationSeconds: number): number {
  return Math.max(
    REENCODE_MIN_TIMEOUT_MS,
    Math.round(durationSeconds * REENCODE_MS_PER_SECOND),
  );
}

/**
 * Run a single exec with two layers of protection so it can never hang the UI:
 *  1. The core-side timeout (passed to exec) interrupts a too-long encode and
 *     makes exec resolve with a non-zero code.
 *  2. A JS watchdog catches the pathological case where the worker is wedged
 *     and never posts anything back. When it fires we terminate the worker so
 *     the app can recover on the next run.
 * Returns ffmpeg's exit code (0 = ok).
 */
async function execWithWatchdog(
  instance: FFmpeg,
  args: string[],
  coreTimeoutMs: number,
  label: string,
): Promise<number> {
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  const watchdogPromise = new Promise<never>((_, reject) => {
    watchdog = setTimeout(() => {
      reject(
        new ReencodeTimeoutError(
          `O FFmpeg travou em ${label} (sem resposta após ` +
            `${Math.round((coreTimeoutMs + WATCHDOG_GRACE_MS) / 1000)}s).`,
          recentLogTail(),
        ),
      );
    }, coreTimeoutMs + WATCHDOG_GRACE_MS);
  });

  // Attach a no-op catch so that, if the watchdog wins the race, the eventual
  // rejection of exec() (e.g. from terminate()) doesn't surface as unhandled.
  const execPromise = instance.exec(args, coreTimeoutMs);
  execPromise.catch(() => {});

  try {
    return await Promise.race([execPromise, watchdogPromise]);
  } finally {
    clearTimeout(watchdog);
  }
}

/**
 * Tear down a wedged engine so the next operation reloads a fresh one. Called
 * only after the watchdog fires — the worker is assumed unusable at that point.
 */
function hardResetInstance(): void {
  try {
    ffmpeg?.terminate();
  } catch {
    // ignore — best effort
  }
  ffmpeg = null;
  loadPromise = null;
}

async function reencodeSlices(
  instance: FFmpeg,
  { file, cutTimes, totalDuration, features, onProgress, onSegment }: SliceOptions,
): Promise<VideoSegment[]> {
  const inputName = "input" + getExtension(file.name);
  const metas = segmentsMeta(cutTimes, totalDuration);
  const total = metas.length;

  // Report overall progress as (finished parts + current part fraction) / total.
  let currentIndex = 0;
  const progressListener = ({ progress }: { progress: number }) => {
    const overall = (currentIndex + clamp01(progress)) / total;
    onProgress?.(clamp01(overall));
  };
  instance.on("progress", progressListener);

  try {
    await instance.writeFile(inputName, await fetchFile(file));

    const segments: VideoSegment[] = [];

    for (let i = 0; i < total; i++) {
      currentIndex = i;
      const meta = metas[i];
      const outName = `out_${String(i).padStart(3, "0")}.mp4`;

      let badgeName: string | null = null;
      if (features.numbering) {
        badgeName = `badge_${i}.png`;
        await instance.writeFile(badgeName, await buildPartBadge(i + 1, total));
      }

      const args = buildReencodeArgs({
        inputName,
        badgeName,
        outName,
        start: meta.start,
        duration: meta.duration,
        vertical: features.vertical,
      });

      const label = `parte ${i + 1}/${total}`;
      const timeoutMs = partTimeoutMs(meta.duration);
      console.info(
        `[ffmpeg] reencode ${label} (9:16=${features.vertical}, timeout=${Math.round(
          timeoutMs / 1000,
        )}s)`,
      );

      let code: number;
      try {
        code = await execWithWatchdog(instance, args, timeoutMs, label);
      } catch (err) {
        // Watchdog fired: the worker is wedged, so reset the engine and surface
        // a friendly, duck-themed error instead of leaving the bar at 0%.
        if (err instanceof ReencodeTimeoutError) {
          console.error("[ffmpeg] watchdog:", err.message, "\n", err.ffmpegLog);
          hardResetInstance();
        }
        throw err;
      }

      if (code !== 0) {
        const tail = recentLogTail();
        console.error(
          `[ffmpeg] reencode ${label} falhou (código ${code}). Log:\n${tail}`,
        );
        // A non-zero code here is almost always the core's timeout firing on a
        // sub-realtime encode, but it also covers any genuine command failure.
        throw new ReencodeTimeoutError(
          `O reenquadramento 9:16 da ${label} não terminou a tempo ` +
            `(código ${code}).`,
          tail,
        );
      }

      const segment = await readSegment(instance, outName, i + 1, {
        start: meta.start,
        duration: meta.duration,
      });
      segments.push(segment);
      onSegment?.(segment);

      await safeDelete(instance, outName);
      if (badgeName) await safeDelete(instance, badgeName);
      // Nudge the bar to the part boundary even if the encoder went quiet.
      onProgress?.(clamp01((i + 1) / total));
    }

    return segments;
  } finally {
    instance.off("progress", progressListener);
    await safeDelete(instance, inputName);
  }
}

interface ReencodeArgs {
  inputName: string;
  badgeName: string | null;
  outName: string;
  start: number;
  duration: number;
  vertical: VerticalMode;
}

function buildReencodeArgs(opts: ReencodeArgs): string[] {
  const { inputName, badgeName, outName, start, duration, vertical } = opts;
  const hasBadge = Boolean(badgeName);

  const { filter, videoLabel } = buildFilterComplex(vertical, hasBadge);

  // -ss before -i seeks fast to the nearest keyframe, then decodes to the exact
  // point; -t bounds the output duration. Re-encoding makes the cut frame-exact.
  const args: string[] = ["-ss", String(start), "-i", inputName];
  if (badgeName) args.push("-i", badgeName);
  args.push("-t", String(duration));

  if (filter) {
    args.push("-filter_complex", filter, "-map", videoLabel);
  } else {
    args.push("-map", "0:v:0");
  }

  args.push(
    "-map", "0:a?",
    "-c:v", "libx264",
    // ultrafast is ~2x faster than veryfast on the single-thread wasm core,
    // which is the difference between "usable on a phone" and "stuck at 0%".
    "-preset", "ultrafast",
    "-crf", "20",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    outName,
  );

  return args;
}

/**
 * Build the filter_complex for the re-encode path, returning the chain plus the
 * label of the final video stream to map. Targets a 720x1280 (9:16) canvas —
 * the real display size for Stories, ~2.25x fewer pixels than 1080x1920, which
 * roughly halves the single-thread encode time with no perceptible loss.
 */
function buildFilterComplex(
  vertical: VerticalMode,
  hasBadge: boolean,
): { filter: string | null; videoLabel: string } {
  const steps: string[] = [];
  let label: string;

  if (vertical === "off") {
    label = "0:v:0";
  } else if (vertical === "fill") {
    steps.push(
      "[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280[v]",
    );
    label = "[v]";
  } else if (vertical === "color") {
    steps.push(
      "[0:v]scale=720:1280:force_original_aspect_ratio=decrease," +
        "pad=720:1280:(ow-iw)/2:(oh-ih)/2:color=0xbfe7ff[v]",
    );
    label = "[v]";
  } else {
    // "blur": a blurred copy of the video as the backdrop. The background is
    // *blurred anyway*, so we build it at a tiny resolution (cheap boxblur) and
    // upscale — visually identical to blurring at full size, but far cheaper.
    steps.push(
      "[0:v]split=2[bg][fg]",
      "[bg]scale=180:320:force_original_aspect_ratio=increase,crop=180:320," +
        "boxblur=8:1,scale=720:1280[bgb]",
      "[fg]scale=720:1280:force_original_aspect_ratio=decrease[fgs]",
      "[bgb][fgs]overlay=(W-w)/2:(H-h)/2[v]",
    );
    label = "[v]";
  }

  if (hasBadge) {
    // Discreet top-right placement, relative to the 720-wide canvas.
    const base = label === "0:v:0" ? "[0:v]" : label;
    steps.push(`${base}[1:v]overlay=W-w-36:36[vout]`);
    label = "[vout]";
  }

  return { filter: steps.length > 0 ? steps.join(";") : null, videoLabel: label };
}

// ---------------------------------------------------------------------------
// Shared helpers.
// ---------------------------------------------------------------------------

async function readSegment(
  instance: FFmpeg,
  fsName: string,
  index: number,
  meta: { start: number; duration: number },
): Promise<VideoSegment> {
  const data = (await instance.readFile(fsName)) as Uint8Array;
  // Copy into a fresh ArrayBuffer-backed blob so it survives FS cleanup.
  const blob = new Blob([data.slice()], { type: "video/mp4" });
  return {
    index,
    fileName: partFileName(index),
    blob,
    url: URL.createObjectURL(blob),
    startTime: meta.start,
    duration: meta.duration,
  };
}

async function safeDelete(instance: FFmpeg, name: string): Promise<void> {
  try {
    await instance.deleteFile(name);
  } catch {
    // ignore — file may already be gone
  }
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot === -1) return ".mp4";
  const ext = fileName.slice(dot).toLowerCase();
  return /^\.[a-z0-9]{2,5}$/.test(ext) ? ext : ".mp4";
}
