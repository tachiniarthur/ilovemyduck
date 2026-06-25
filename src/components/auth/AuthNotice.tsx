import Icon from "../Icon";

/**
 * Shown after a valid submit while there's no backend: makes it clear the form
 * is wired visually but auth isn't connected yet. Replace with real success/
 * error handling once authentication is plugged in.
 */
export default function AuthNotice({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="mb-5 flex items-start gap-3 rounded-card border border-pond-400/40 bg-pond-300/20 px-4 py-3"
    >
      <span className="mt-0.5 shrink-0 text-pond-700">
        <Icon name="check" size={18} />
      </span>
      <p className="font-body text-sm leading-relaxed text-pond-700">{message}</p>
    </div>
  );
}
