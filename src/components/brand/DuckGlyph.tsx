interface DuckGlyphProps {
  size?: number;
  className?: string;
  /** Decorative by default; pass a label to expose it to assistive tech. */
  title?: string;
}

/**
 * A flat, minimal duck-head mark, the grown-up replacement for the old 3D
 * googly mascot. Two warm tones, one calm eye, no blush or gloss. Meant to be
 * used small: in the logo lockup and as a pointed accent, never as a
 * page-dominating illustration.
 */
export default function DuckGlyph({
  size = 28,
  className = "",
  title,
}: DuckGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/* head */}
      <circle cx="14" cy="15" r="9.5" fill="#ffc41f" />
      {/* subtle top light for a hint of form, not a cartoon gloss */}
      <path
        d="M14 5.5a9.5 9.5 0 0 1 8.4 5.1A9.5 9.5 0 0 0 6 12.2 9.5 9.5 0 0 1 14 5.5Z"
        fill="#ffd54a"
      />
      {/* hair tuft */}
      <path
        d="M13 6.4c.4-2.3 2.2-3.3 3.6-2.4-.2 1.6-1.5 2.7-3.6 2.4Z"
        fill="#ffc41f"
      />
      {/* bill */}
      <path
        d="M22 12.6c4.6-.5 7.2.6 7.2 2.7 0 2-2.6 3.1-7.2 2.6-1.8-.3-1.8-5 0-5.3Z"
        fill="#ed5e00"
      />
      <path
        d="M22.4 15.3c3 .1 5.1.2 6.6.2-1.5.5-3.7.7-6.6.5-.5 0-.5-.6 0-.7Z"
        fill="#b84800"
        opacity="0.5"
      />
      {/* eye */}
      <circle cx="12" cy="13.2" r="1.7" fill="#241a12" />
    </svg>
  );
}
