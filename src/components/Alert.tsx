import Icon from "./Icon";

interface AlertProps {
  title: string;
  message: string;
  tone?: "error" | "warning";
  onDismiss?: () => void;
  action?: { label: string; onClick: () => void };
  /** Raw technical detail (e.g. the ffmpeg log tail), shown collapsed. */
  details?: string;
}

export default function Alert({
  title,
  message,
  tone = "error",
  onDismiss,
  action,
  details,
}: AlertProps) {
  // Two restrained treatments inside the duck palette: a burnt-orange accent
  // bar for true errors, a softer duck-yellow bar for cautions. The accent bar
  // gives each alert identity without borrowing the solid CTA orange.
  const isError = tone === "error";
  const toneStyles = isError
    ? "bg-bill-500/[0.06] border-bill-500/30"
    : "bg-duck-100/70 border-duck-300";
  const accentBar = isError ? "bg-bill-600" : "bg-duck-400";
  const iconColor = isError ? "text-bill-600" : "text-duck-600";
  const titleColor = isError ? "text-bill-700" : "text-ink";

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 overflow-hidden rounded-card border p-4 pl-5 ${toneStyles}`}
    >
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 ${accentBar}`} />
      <span className={`mt-0.5 shrink-0 ${iconColor}`} aria-hidden>
        <Icon name="shield" size={20} />
      </span>
      <div className="flex-1">
        <p className={`font-display text-base font-semibold leading-snug ${titleColor}`}>
          {title}
        </p>
        <p className="mt-1 font-body text-sm leading-relaxed text-ink-soft">{message}</p>

        {details && (
          <details className="mt-2.5">
            <summary className="cursor-pointer font-body text-xs font-semibold text-ink-muted transition-colors hover:text-ink">
              Ver detalhes técnicos
            </summary>
            <pre className="mt-1.5 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-field bg-ink/5 p-3 font-mono text-[11px] leading-snug text-ink-soft ring-1 ring-bark-200">
              {details}
            </pre>
          </details>
        )}

        {(action || onDismiss) && (
          <div className="mt-3 flex gap-2">
            {action && (
              <button
                type="button"
                onClick={action.onClick}
                className="btn-primary px-4 py-1.5 text-sm"
              >
                {action.label}
              </button>
            )}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="btn-secondary px-4 py-1.5 text-sm"
              >
                Fechar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
