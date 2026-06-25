"use client";

import { useId, useState } from "react";
import Icon, { type IconName } from "../Icon";

interface AuthFieldProps {
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  icon?: IconName;
  placeholder?: string;
  autoComplete?: string;
  /** Visual-only validation message; styles the field as invalid when set. */
  error?: string;
}

/**
 * A labelled input with an optional leading icon and (for passwords) a
 * show/hide toggle. Validation is visual-only and driven by the `error` prop,
 * pages decide when to compute it. Wired for accessibility (aria-invalid,
 * aria-describedby) so real validation can reuse the same markup.
 */
export default function AuthField({
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  icon,
  placeholder,
  autoComplete,
  error,
}: AuthFieldProps) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && reveal ? "text" : type;
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bark-400">
            <Icon name={icon} size={18} />
          </span>
        )}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`field-input ${icon ? "pl-10" : ""} ${
            isPassword ? "pr-11" : ""
          } ${error ? "field-input-error" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-bark-500 transition-colors hover:bg-cream-200 hover:text-ink"
          >
            <Icon name={reveal ? "eye-off" : "eye"} size={18} />
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 font-body text-xs font-medium text-bill-700">
          {error}
        </p>
      )}
    </div>
  );
}
