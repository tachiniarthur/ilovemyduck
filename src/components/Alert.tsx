import DuckMascot from "./DuckMascot";

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
  // Distinct semantic treatments inside the duck palette: a deep bill-orange
  // bar for true errors (something broke) vs. a softer duck-yellow bar for
  // cautions (heads-up). The accent bar gives each alert its own identity
  // without borrowing the solid bill-500 used by the primary CTA.
  const isError = tone === "error";
  const toneStyles = isError
    ? "bg-bill-500/[0.08] ring-bill-500/30"
    : "bg-duck-100/80 ring-duck-300";
  const accentBar = isError ? "bg-bill-500" : "bg-duck-400";
  const titleColor = isError ? "text-bill-600" : "text-duck-700";

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 overflow-hidden rounded-3xl p-4 pl-5 ring-1 backdrop-blur-sm ${toneStyles}`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-1.5 ${accentBar}`}
      />
      <DuckMascot size={56} mood="sad" className="shrink-0" />
      <div className="flex-1">
        <p className={`font-display text-base font-extrabold leading-snug tracking-tight ${titleColor}`}>
          {title}
        </p>
        <p className="mt-1 font-body text-sm leading-relaxed text-duck-700/80">{message}</p>

        {details && (
          <details className="mt-2.5">
            <summary className="cursor-pointer font-body text-xs font-bold text-duck-700/70 transition-colors hover:text-duck-700">
              Ver detalhes técnicos
            </summary>
            <pre className="mt-1.5 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-duck-700/5 p-3 font-mono text-[11px] leading-snug text-duck-700/90 ring-1 ring-duck-200/70">
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
                className="btn-primary rounded-full px-4 py-1.5 text-sm shadow"
              >
                {action.label}
              </button>
            )}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="btn rounded-full px-4 py-1.5 text-sm font-bold text-duck-700 hover:bg-duck-100 active:translate-y-0.5"
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
