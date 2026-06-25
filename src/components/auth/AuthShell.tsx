import Link from "next/link";
import type { ReactNode } from "react";
import DuckLogo from "../brand/DuckLogo";
import StoryStrip from "../brand/StoryStrip";
import Icon from "../Icon";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Links shown under the form (e.g. "já tem conta?"). */
  footer: ReactNode;
  /** Interactive mascot perched above the title (see <AuthDuck>). */
  duck?: ReactNode;
}

/**
 * Shared visual shell for the auth screens: a calm brand panel on the left
 * (desktop) and the form card on the right. Purely presentational, pages own
 * their state and submit handlers, so real auth plugs straight in.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  duck,
}: AuthShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-bark-200 bg-gradient-to-br from-duck-100 via-cream-100 to-sky-200/50 p-12 lg:flex">
        <DuckLogo />
        <div className="max-w-sm">
          <h2 className="text-balance font-display text-display-lg font-semibold text-ink">
            Um vídeo, vários{" "}
            <span className="italic text-bill-600">Stories</span>.
          </h2>
          <p className="mt-4 text-pretty font-body leading-relaxed text-ink-muted">
            Entre para guardar seu ritmo de cortes e seguir fatiando vídeos,
            sempre com tudo acontecendo no seu próprio aparelho.
          </p>
          <div className="mt-8 max-w-xs">
            <StoryStrip />
          </div>
        </div>
        <p className="inline-flex items-center gap-2 font-mono text-xs text-pond-700">
          <Icon name="shield" size={15} />
          Seu vídeo nunca sai do seu aparelho
        </p>
      </aside>

      {/* Form side */}
      <div className="flex flex-col px-5 py-8 sm:px-8">
        <div className="lg:hidden">
          <DuckLogo />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            {duck && (
              <div className="mb-2 flex justify-center">
                <div className="w-28 sm:w-32">{duck}</div>
              </div>
            )}
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
              {title}
            </h1>
            <p className="mt-2 text-pretty font-body text-ink-muted">{subtitle}</p>

            <div className="mt-8">{children}</div>

            <div className="mt-6 text-center font-body text-sm text-ink-muted">
              {footer}
            </div>
          </div>
        </div>

        <p className="text-center font-body text-xs text-bark-400">
          <Link href="/" className="rounded transition-colors hover:text-bill-700">
            ← Voltar para a página inicial
          </Link>
        </p>
      </div>
    </div>
  );
}
