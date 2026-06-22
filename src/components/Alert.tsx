import DuckMascot from "./DuckMascot";

interface AlertProps {
  title: string;
  message: string;
  tone?: "error" | "warning";
  onDismiss?: () => void;
  action?: { label: string; onClick: () => void };
}

export default function Alert({
  title,
  message,
  tone = "error",
  onDismiss,
  action,
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
