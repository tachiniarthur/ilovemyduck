import Image from "next/image";

interface DuckGlyphProps {
  size?: number;
  className?: string;
  /** Decorative by default; pass a label to expose it to assistive tech. */
  title?: string;
}

/**
 * The duck mark, rendered from /logo.png. Used small: in the logo lockup and as
 * a pointed accent, never as a page-dominating illustration.
 */
export default function DuckGlyph({
  size = 28,
  className = "",
  title,
}: DuckGlyphProps) {
  return (
    <Image
      src="/logo.png"
      width={size}
      height={size}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      className={`object-contain ${className}`}
    />
  );
}
