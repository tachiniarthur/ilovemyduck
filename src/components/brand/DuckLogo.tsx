import Link from "next/link";
import DuckGlyph from "./DuckGlyph";

interface DuckLogoProps {
  /** Render as a non-link (e.g. inside the footer). */
  asLink?: boolean;
  className?: string;
  glyphSize?: number;
}

/**
 * The sophisticated logo treatment: the flat duck glyph paired with a Fraunces
 * wordmark. Replaces the old big-PNG-in-a-box lockup. "Duck" carries the accent
 * colour so the mark has a focal point without an oversized illustration.
 */
export default function DuckLogo({
  asLink = true,
  className = "",
  glyphSize = 44,
}: DuckLogoProps) {
  const inner = (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-duck-100 ring-1 ring-bark-200">
        <DuckGlyph size={glyphSize} title="I Love My Duck" />
      </span>
      <span className="font-display text-[1.15rem] font-semibold leading-none tracking-tight text-ink">
        I&nbsp;Love&nbsp;My{" "}
        <span className="font-bold italic text-bill-600">Duck</span>
      </span>
    </span>
  );

  if (!asLink) {
    return <span className={className}>{inner}</span>;
  }

  return (
    <Link
      href="/"
      aria-label="I Love My Duck, página inicial"
      className={`inline-flex rounded-xl ${className}`}
    >
      {inner}
    </Link>
  );
}
