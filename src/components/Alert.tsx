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
  const toneStyles =
    tone === "error"
      ? "bg-bill-500/10 ring-bill-500/40"
      : "bg-duck-100 ring-duck-300";

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-3xl p-4 ring-1 ${toneStyles}`}
    >
      <DuckMascot size={56} mood="sad" className="shrink-0" />
      <div className="flex-1">
        <p className="font-display text-base font-extrabold text-bill-600">
          {title}
        </p>
        <p className="mt-0.5 font-body text-sm text-duck-700/80">{message}</p>

        {details && (
          <details className="mt-2">
            <summary className="cursor-pointer font-body text-xs font-bold text-duck-700/70 hover:text-duck-700">
              Ver detalhes técnicos
            </summary>
            <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-duck-900/5 p-3 font-mono text-[11px] leading-snug text-duck-700/90">
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
                className="rounded-full bg-bill-500 px-4 py-1.5 font-display text-sm font-extrabold text-white shadow hover:bg-bill-400"
              >
                {action.label}
              </button>
            )}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-full px-4 py-1.5 font-display text-sm font-bold text-duck-700 hover:bg-duck-100"
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
