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
      <aside className="auth-aside relative hidden flex-col overflow-hidden border-r border-bark-200 px-12 py-14 lg:flex xl:px-16">
        {/* Discreet organic depth: soft blurred brand-tinted blobs ... */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 top-20 h-60 w-60 rounded-full bg-duck-300/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 top-1/3 h-52 w-52 rounded-full bg-sky-300/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-pond-300/25 blur-3xl"
        />
        {/* ... and a faint water/duck wave-and-bubbles layer at the foot. */}
        <svg
          aria-hidden="true"
          className="auth-aside-decor"
          viewBox="0 0 600 800"
          preserveAspectRatio="xMidYMax slice"
          fill="none"
        >
          <path
            d="M0 612 C 110 572 190 660 300 632 C 410 604 500 668 600 632 L600 800 L0 800 Z"
            fill="#8fd6ff"
            opacity="0.14"
          />
          <path
            d="M0 686 C 120 650 210 724 330 696 C 440 670 520 726 600 700 L600 800 L0 800 Z"
            fill="#5fd6a0"
            opacity="0.12"
          />
          <circle cx="86" cy="540" r="9" fill="#54bdff" opacity="0.18" />
          <circle cx="128" cy="576" r="5" fill="#54bdff" opacity="0.16" />
          <circle cx="512" cy="560" r="11" fill="#5fd6a0" opacity="0.16" />
          <circle cx="486" cy="600" r="6" fill="#5fd6a0" opacity="0.14" />
          <circle cx="300" cy="582" r="4" fill="#ffc41f" opacity="0.2" />
        </svg>

        {/* One full-height column: logo anchored at the top, the main pitch
            centred in the available space, and the trust seal anchored at the
            foot. A generous, horizontally-centred max width lets the content
            breathe across the whole panel instead of hugging the corner. */}
        <div className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col">
          <DuckLogo />

          <div className="flex flex-1 flex-col justify-center py-12">
            <span className="eyebrow">
              <Icon name="scissors" size={14} />
              Fatie sem complicação
            </span>
            <h2 className="mt-6 text-balance font-display text-display-xl font-semibold leading-[1.02] text-ink">
              Um vídeo, vários{" "}
              <span className="italic text-bill-600">Stories</span>.
            </h2>
            <p className="mt-6 max-w-md text-pretty font-body text-lg leading-relaxed text-ink-muted">
              Entre para guardar seu ritmo de cortes e seguir fatiando vídeos,
              sempre com tudo acontecendo no seu próprio aparelho.
            </p>
            <div className="mt-10 w-full">
              <StoryStrip animated />
            </div>
          </div>

          <div>
            <span className="inline-flex w-fit items-center gap-2.5 rounded-full border border-pond-300/70 bg-cream-50/80 py-2 pl-2.5 pr-4 shadow-button backdrop-blur-sm">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pond-500/15 text-pond-600">
                <Icon name="shield" size={15} />
              </span>
              <span className="font-mono text-xs font-medium leading-tight text-pond-700">
                Seu vídeo nunca sai do seu aparelho
              </span>
            </span>
          </div>
        </div>
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
            <h1 className="text-center font-display text-3xl font-semibold tracking-tight text-ink">
              {title}
            </h1>
            <p className="mt-2 text-pretty text-center font-body text-ink-muted">
              {subtitle}
            </p>

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
