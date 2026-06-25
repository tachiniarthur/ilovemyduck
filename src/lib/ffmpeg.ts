import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import type { VideoSegment } from "@/types";
import { partFileName, segmentsMeta } from "./format";

// Single-threaded core. We deliberately do NOT use @ffmpeg/core-mt here:
//   - The default slicing path is a pure stream copy, which is already near
//     instant on the single-thread core, multi-threading buys nothing there.
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
 * own log), so that, even on iOS Safari, where the dev console is out of reach,
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

/**
 * Thrown when the fast stream-copy path fails (e.g. an iPhone .mov whose video
 * codec/keyframe layout the MP4 segment muxer won't copy). It carries the real
 * ffmpeg log tail and is caught internally to trigger the re-encode fallback,
 * it should never reach the UI on its own.
 */
export class CopySliceError extends Error {
  readonly ffmpegLog: string;
  constructor(message: string, ffmpegLog: string) {
    super(message);
    this.name = "CopySliceError";
    this.ffmpegLog = ffmpegLog;
  }
}

/** Thrown when a re-encode fallback part fails (bad command, OOM, codec, etc.). */
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
 * frame (no black intro), at the cost of the boundary landing a little off the
 * exact requested time, which is irrelevant for Stories.
 *
 * Fallback path: only taken when the copy can't mux this input (common with
 * iPhone .mov HEVC captures). We then re-encode each part individually to
 * H.264/AAC (fast x264 preset), keeping the original framing, slower than copy,
 * but it always produces playable MP4 parts.
 */
export async function sliceVideo(options: SliceOptions): Promise<VideoSegment[]> {
  const instance = await loadFFmpeg(options.onLog);

  try {
    return await copySlices(instance, options);
  } catch (err) {
    if (!(err instanceof CopySliceError)) throw err;
    // The fast copy couldn't mux this input (common with iPhone .mov HEVC
    // captures). Fall back to a per-part H.264/AAC re-encode, which always fits
    // the MP4 container. This re-encodes the original frames as-is, just
    // normalizing the codec. The re-encode path carries its own
    // watchdog/timeout, so it can't hang the UI either.
    console.warn(
      "[ffmpeg] cópia direta falhou, recorrendo ao re-encode:",
      err.message,
    );
    options.onProgress?.(0);
    return reencodeSlices(instance, options);
  }
}

// ---------------------------------------------------------------------------
// Fast path, stream copy via the segment muxer.
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

    // Map ONLY the first video and the first audio track, explicitly. iPhone
    // .mov captures routinely carry extra tracks beyond the obvious ones, a
    // second "spatial audio" stream, timecode, or timed metadata. ffmpeg's
    // default auto-mapping (and even "-map 0:a", which selects *every* audio
    // stream) would pull in that second audio stream, whose codec ffmpeg can't
    // identify ("Decoder (codec none) not found for input stream #0:2"), and
    // the whole run aborts. Pinning to 0:v:0 + 0:a:0 keeps the output identical
    // for normal videos while dropping the extra tracks that break muxing. The
    // trailing "?" on the audio map makes a silent (audio-less) video still work.
    const videoTag = (await probeIsHevc(instance, inputName))
      ? // HEVC copies fine into MP4, but ffmpeg tags it "hev1" by default, which
        // Apple players (Safari/iOS/QuickTime) refuse to decode. Forcing "hvc1"
        // makes the copied part play everywhere, no re-encode needed.
        ["-tag:v", "hvc1"]
      : [];

    let code: number;
    if (sorted.length === 0) {
      // Single part, just copy the whole thing.
      console.info("[ffmpeg] copy (parte única)");
      code = await instance.exec([
        "-i", inputName,
        "-map", "0:v:0",
        "-map", "0:a:0?",
        "-c", "copy",
        ...videoTag,
        "part_000.mp4",
      ]);
    } else {
      console.info("[ffmpeg] copy via segment muxer; cortes:", sorted);
      code = await instance.exec([
        "-i", inputName,
        "-map", "0:v:0",
        "-map", "0:a:0?",
        "-c", "copy",
        ...videoTag,
        "-f", "segment",
        "-segment_times", sorted.join(","),
        "-reset_timestamps", "1",
        outputPattern,
      ]);
    }

    // exec() returns ffmpeg's exit code; non-zero means the command failed.
    if (code !== 0) {
      throw new CopySliceError(
        `FFmpeg terminou com código ${code} ao fatiar o vídeo.`,
        recentLogTail(),
      );
    }

    return await collectSegments(instance, cutTimes, totalDuration, onSegment);
  } finally {
    instance.off("progress", progressListener);
    await safeDelete(instance, inputName);
  }
}

/**
 * Probe whether the input's video stream is HEVC (h.265), without decoding.
 * iPhone .mov captures are usually HEVC. We run ffmpeg with an input but no
 * output: it demuxes the header, prints the stream info into our log ring, then
 * exits non-zero (no output file), which we ignore. We only care about the
 * "Video: hevc" line it logged on the way out.
 */
async function probeIsHevc(instance: FFmpeg, inputName: string): Promise<boolean> {
  try {
    // No output file → ffmpeg exits with a non-zero code after dumping streams.
    // That's expected; we read the codec from the captured log, not the code.
    await instance.exec(["-hide_banner", "-i", inputName]);
    return /Video:\s*hevc/i.test(recentLogTail(LOG_RING_SIZE));
  } catch {
    // The hvc1 tag is only an enhancement, never let a probe hiccup abort the
    // copy. Worst case we skip the tag and the part still muxes.
    return false;
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
    throw new CopySliceError(
      "Nenhum segmento foi gerado, o muxer não produziu nenhum arquivo de saída.",
      recentLogTail(),
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
// Fallback path, per-part re-encode (codec normalization for inputs the copy
// muxer rejects, e.g. iPhone .mov HEVC captures).
// ---------------------------------------------------------------------------

// Re-encoding with the single-thread libx264 is sub-realtime, so a part
// legitimately takes a while, especially on phones. We never wait forever
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
 * only after the watchdog fires, the worker is assumed unusable at that point.
 */
function hardResetInstance(): void {
  try {
    ffmpeg?.terminate();
  } catch {
    // ignore, best effort
  }
  ffmpeg = null;
  loadPromise = null;
}

async function reencodeSlices(
  instance: FFmpeg,
  { file, cutTimes, totalDuration, onProgress, onSegment }: SliceOptions,
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

      const args = buildReencodeArgs({
        inputName,
        outName,
        start: meta.start,
        duration: meta.duration,
      });

      const label = `parte ${i + 1}/${total}`;
      const timeoutMs = partTimeoutMs(meta.duration);
      console.info(
        `[ffmpeg] reencode ${label} (timeout=${Math.round(timeoutMs / 1000)}s)`,
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
          `O re-encode da ${label} não terminou a tempo (código ${code}).`,
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
  outName: string;
  start: number;
  duration: number;
}

function buildReencodeArgs(opts: ReencodeArgs): string[] {
  const { inputName, outName, start, duration } = opts;

  // -ss before -i seeks fast to the nearest keyframe, then decodes to the exact
  // point; -t bounds the output duration. Re-encoding makes the cut frame-exact
  // while normalizing the codec to H.264/AAC so the MP4 container always accepts
  // it. The original framing is preserved (no scaling/cropping).
  return [
    "-ss", String(start),
    "-i", inputName,
    "-t", String(duration),
    // Same explicit single-stream mapping as the copy path: take only the first
    // video + first audio track, so iPhone .mov spatial-audio/metadata streams
    // never reach the encoder (which has no decoder for them). "?" keeps it
    // working for silent videos.
    "-map", "0:v:0",
    "-map", "0:a:0?",
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
  ];
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
    // ignore, file may already be gone
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
