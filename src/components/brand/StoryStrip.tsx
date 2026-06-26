import Icon from "../Icon";
import DuckGlyph from "./DuckGlyph";

/**
 * The signature product motif: one long video resolving into a row of 9:16
 * story frames, divided by a perforated "slice line". It carries the whole
 * idea of the product (long → cut → Stories) without any literal screenshot,
 * so the hero has a real focal artefact instead of a giant emoji.
 */
const FRAME_TINTS = [
  "from-sky-200/70 to-sky-300/40",
  "from-duck-200/80 to-duck-300/50",
  "from-pond-300/70 to-pond-400/40",
  "from-bill-400/40 to-bill-500/25",
];

/**
 * `animated` plays a calm, looping demo of the whole product idea (used on the
 * auth brand panel): the player progress fills, the scissors snip the slice
 * line, then the four story frames resolve in sequence, hold, and the loop
 * gently resets. Everything is neutralised to a static card by reduced-motion.
 */
export default function StoryStrip({ animated = false }: { animated?: boolean }) {
  return (
    <div
      className={`card relative overflow-hidden p-5 sm:p-6 ${
        animated ? "is-animated" : ""
      }`}
    >
      {/* Source video bar */}
      <div className="flex items-center gap-3 rounded-xl border border-bark-200 bg-cream-100 px-4 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink text-cream-50">
          <Icon name="play" size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-body text-xs font-semibold text-ink">video-completo.mp4</p>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-bark-200">
            <div className="strip-progress h-full w-full origin-left rounded-full bg-gradient-to-r from-duck-400 via-bill-400 to-bill-600" />
          </div>
        </div>
        <span className="shrink-0 font-mono text-xs text-ink-muted">3:12</span>
      </div>

      {/* Slice line with scissors riding the perforation */}
      <div className="relative my-5 flex items-center">
        <span className="slice-line w-full" />
        <span className="strip-scissors absolute left-1/2 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full border border-bark-200 bg-cream-50 text-bill-600 shadow-button">
          <Icon name="scissors" size={15} />
        </span>
      </div>

      {/* Resulting story frames */}
      <div className="grid grid-cols-4 gap-2.5">
        {FRAME_TINTS.map((tint, i) => (
          <div
            key={i}
            className={`strip-frame relative aspect-[9/16] overflow-hidden rounded-lg bg-gradient-to-b ${tint} ring-1 ring-bark-200`}
          >
            <span className="absolute left-1.5 top-1.5 rounded-md bg-ink/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-cream-50">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center font-body text-xs text-ink-muted">
        1 vídeo · <span className="font-semibold text-bill-700">4 Stories</span> na
        ordem certa
      </p>
    </div>
  );
}
