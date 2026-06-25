import Image from "next/image";
import DuckGlyph from "./DuckGlyph";

interface PhoneMockupProps {
  /**
   * Drop a real screenshot here later (path under /public, e.g.
   * "/screenshots/corte.png"). While empty, an elegant placeholder shows.
   */
  src?: string;
  alt?: string;
  className?: string;
}

/**
 * An empty phone frame holding a 9:16 screen, ready to receive a real app
 * screenshot. To swap: put the image in /public and pass `src` + `alt`. No
 * other change needed.
 */
export default function PhoneMockup({ src, alt = "", className = "" }: PhoneMockupProps) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[15rem] rounded-[2rem] border border-bark-300 bg-ink p-2.5 shadow-card-lift ${className}`}
    >
      {/* notch */}
      <span
        aria-hidden
        className="absolute left-1/2 top-3 z-10 h-1.5 w-14 -translate-x-1/2 rounded-full bg-cream-50/30"
      />
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.5rem] bg-cream-100">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 60vw, 240px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-cream-100 to-duck-100/50 text-center">
            <span
              aria-hidden
              className="absolute inset-2 rounded-[1.2rem] border border-dashed border-bark-300"
            />
            <DuckGlyph size={34} />
            <p className="px-4 font-mono text-[11px] uppercase tracking-wider text-bark-500">
              Captura em breve
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
