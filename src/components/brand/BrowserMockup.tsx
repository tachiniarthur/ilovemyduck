import Image from "next/image";

interface BrowserMockupProps {
  src: string;
  alt: string;
  /** Aspect ratio of the screen area, e.g. "16/9". Defaults to a wide capture. */
  ratio?: string;
  /** Which part of the screenshot to anchor, e.g. "object-top" (default) or "object-bottom". */
  objectPosition?: string;
  className?: string;
}

/**
 * A browser-window frame for landscape app screenshots (the real captures are
 * wide, ~1900×900, so a phone frame would crop them). Swap the screenshot by
 * passing `src` + `alt`.
 */
export default function BrowserMockup({
  src,
  alt,
  ratio = "16/9",
  objectPosition = "object-top",
  className = "",
}: BrowserMockupProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-bark-200 bg-cream-50 shadow-card-lift ${className}`}
    >
      {/* chrome bar */}
      <div className="flex items-center gap-1.5 border-b border-bark-200/70 bg-cream-100 px-4 py-2.5">
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-bill-400" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-duck-300" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-bark-300" />
      </div>
      <div className="relative w-full bg-cream-100" style={{ aspectRatio: ratio }}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 1100px"
          className={`object-cover ${objectPosition}`}
        />
      </div>
    </div>
  );
}
