"use client";

import { useEffect, useRef, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import Icon from "./Icon";
import ButtonSpinner from "./ButtonSpinner";

/** Nome curto e amigável a partir dos dados do usuário do Clerk. */
function displayName(user: ReturnType<typeof useUser>["user"]) {
  if (!user) return "Conta";
  return (
    user.firstName ||
    user.username ||
    user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Conta"
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-bill-600 font-body text-sm font-bold text-white">
      {(name[0] ?? "?").toUpperCase()}
    </span>
  );
}

/**
 * Conta do usuário no header, conectada ao Clerk (useUser + signOut). Combina
 * com o visual do site em vez do componente pronto do Clerk.
 * - variant="dropdown": avatar + nome que abrem um menu (desktop).
 * - variant="inline": bloco com dados e botão de sair (menu mobile).
 */
export default function UserMenu({
  variant = "dropdown",
  onSignOut,
}: {
  variant?: "dropdown" | "inline";
  onSignOut?: () => void;
}) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!isLoaded || !user) return null;

  const name = displayName(user);
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const handleSignOut = () => {
    if (signingOut) return;
    setSigningOut(true);
    onSignOut?.();
    void signOut({ redirectUrl: "/" });
  };

  if (variant === "inline") {
    return (
      <div className="px-2 pb-2 pt-3">
        <div className="flex items-center gap-3 rounded-button bg-cream-200/60 px-3 py-2.5">
          <Avatar name={name} />
          <div className="min-w-0">
            <p className="truncate font-body text-sm font-semibold text-ink">{name}</p>
            {email && <p className="truncate font-body text-xs text-ink-muted">{email}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="btn-secondary mt-2 w-full px-4 py-2.5 text-sm disabled:cursor-wait disabled:opacity-70"
        >
          {signingOut ? <ButtonSpinner /> : <Icon name="arrow-right" size={16} />}
          {signingOut ? "Saindo…" : "Sair"}
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full border border-bark-200 bg-cream-50 py-1 pl-1 pr-3 shadow-button transition-colors hover:border-bark-300 hover:bg-cream-100"
      >
        <Avatar name={name} />
        <span className="max-w-[10rem] truncate font-body text-sm font-semibold text-ink">
          {name}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="card absolute right-0 z-50 mt-2 w-64 overflow-hidden p-0"
        >
          <div className="flex items-center gap-3 border-b border-bark-200/70 px-4 py-3.5">
            <Avatar name={name} />
            <div className="min-w-0">
              <p className="truncate font-body text-sm font-semibold text-ink">{name}</p>
              {email && (
                <p className="truncate font-body text-xs text-ink-muted">{email}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-2 px-4 py-3 text-left font-body text-sm font-medium text-ink-soft transition-colors hover:bg-cream-200 disabled:cursor-wait disabled:opacity-70"
          >
            {signingOut ? <ButtonSpinner /> : <Icon name="arrow-right" size={16} />}
            {signingOut ? "Saindo…" : "Sair da conta"}
          </button>
        </div>
      )}
    </div>
  );
}
