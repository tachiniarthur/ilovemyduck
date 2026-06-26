import Icon from "../Icon";

type Tone = "success" | "error";

const TONES: Record<Tone, { wrap: string; text: string; icon: "check" | "close" }> = {
  success: {
    wrap: "border-pond-400/40 bg-pond-300/20",
    text: "text-pond-700",
    icon: "check",
  },
  error: {
    wrap: "border-bill-400/40 bg-bill-300/20",
    text: "text-bill-700",
    icon: "close",
  },
};

/**
 * Inline status banner shown above the form. `tone` switches between a positive
 * (success) and a negative (error) treatment so the auth screens can surface
 * real Clerk results without changing their layout.
 */
export default function AuthNotice({
  message,
  tone = "success",
}: {
  message: string;
  tone?: Tone;
}) {
  const t = TONES[tone];
  return (
    <div
      role="status"
      className={`mb-5 flex items-start gap-3 rounded-card border px-4 py-3 ${t.wrap}`}
    >
      <span className={`mt-0.5 shrink-0 ${t.text}`}>
        <Icon name={t.icon} size={18} />
      </span>
      <p className={`font-body text-sm leading-relaxed ${t.text}`}>{message}</p>
    </div>
  );
}
