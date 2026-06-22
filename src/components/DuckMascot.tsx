import type { AppPhase } from "@/types";

type Mood = "waiting" | "happy" | "processing" | "celebrating" | "sad";

const PHASE_TO_MOOD: Record<AppPhase, Mood> = {
  idle: "waiting",
  ready: "happy",
  processing: "processing",
  done: "celebrating",
  error: "sad",
};

interface DuckMascotProps {
  phase?: AppPhase;
  mood?: Mood;
  size?: number;
  className?: string;
}

/**
 * The star of the show 🦆. A friendly inline-SVG duck whose expression and
 * animation change with the current app phase.
 */
export default function DuckMascot({
  phase,
  mood: moodProp,
  size = 120,
  className = "",
}: DuckMascotProps) {
  const mood: Mood = moodProp ?? (phase ? PHASE_TO_MOOD[phase] : "waiting");

  const animation =
    mood === "celebrating"
      ? "animate-celebrate"
      : mood === "processing"
        ? "animate-bob"
        : "animate-float-slow";

  // Eyes change subtly with mood.
  const eyeY = mood === "celebrating" ? 70 : 72;

  return (
    <div
      className={`relative inline-flex ${animation} ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Mascote pato do I Love My Duck"
    >
      <svg
        viewBox="0 0 160 160"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="duckBody" cx="40%" cy="35%" r="80%">
            <stop offset="0%" stopColor="#ffe588" />
            <stop offset="60%" stopColor="#ffc41f" />
            <stop offset="100%" stopColor="#f7b500" />
          </radialGradient>
          <linearGradient id="duckBill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff9d4d" />
            <stop offset="100%" stopColor="#ff7a18" />
          </linearGradient>
        </defs>

        {/* cheek blush */}
        <ellipse cx="52" cy="92" rx="11" ry="7" fill="#ff9d4d" opacity="0.4" />
        <ellipse cx="116" cy="92" rx="11" ry="7" fill="#ff9d4d" opacity="0.4" />

        {/* body */}
        <circle cx="80" cy="86" r="56" fill="url(#duckBody)" />

        {/* little wing */}
        <path
          d="M118 88 q22 6 14 30 q-16 4 -22 -14 q-2 -10 8 -16 Z"
          fill="#ffd54a"
          opacity="0.9"
        />

        {/* hair tuft */}
        <path
          d="M80 34 q6 -16 16 -8 q-2 8 -10 12 Z"
          fill="#ffc41f"
        />

        {/* eyes */}
        {mood === "celebrating" ? (
          <>
            <path d="M58 70 q6 -8 12 0" stroke="#3a2a00" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M90 70 q6 -8 12 0" stroke="#3a2a00" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        ) : mood === "sad" ? (
          <>
            <circle cx="64" cy={eyeY} r="6" fill="#3a2a00" />
            <circle cx="96" cy={eyeY} r="6" fill="#3a2a00" />
            <path d="M60 60 q4 -4 8 0" stroke="#3a2a00" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M92 60 q4 -4 8 0" stroke="#3a2a00" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="64" cy={eyeY} r="7" fill="#3a2a00" />
            <circle cx="96" cy={eyeY} r="7" fill="#3a2a00" />
            <circle cx="66" cy={eyeY - 2} r="2.4" fill="#fff" />
            <circle cx="98" cy={eyeY - 2} r="2.4" fill="#fff" />
          </>
        )}

        {/* bill */}
        {mood === "celebrating" ? (
          <ellipse cx="80" cy="98" rx="20" ry="14" fill="url(#duckBill)" />
        ) : (
          <ellipse cx="80" cy="96" rx="22" ry="11" fill="url(#duckBill)" />
        )}
        <ellipse cx="80" cy="93" rx="22" ry="5" fill="#ed5e00" opacity="0.25" />
      </svg>
    </div>
  );
}
