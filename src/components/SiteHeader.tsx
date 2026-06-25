"use client";

import { useState } from "react";
import Link from "next/link";
import DuckLogo from "./brand/DuckLogo";
import Icon from "./Icon";

// Section anchors are absolute (prefixed with "/") so they resolve from the
// tool and auth pages too, not just the landing page.
const NAV = [
  { label: "Como funciona", href: "/#como-funciona" },
  { label: "Demonstração", href: "/#demonstracao" },
  { label: "Planos", href: "/#planos" },
  { label: "Fatiador", href: "/fatiar" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-bark-200/70 bg-cream-100/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <DuckLogo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Principal">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded font-body text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="btn-ghost px-3 py-2 text-sm">
            Entrar
          </Link>
          <Link href="/cadastro" className="btn-primary px-4 py-2 text-sm">
            Criar conta
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="btn-secondary h-10 w-10 p-0 md:hidden"
        >
          <Icon name={open ? "close" : "menu"} size={20} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          className="border-t border-bark-200/70 bg-cream-100/95 backdrop-blur-md md:hidden"
        >
          <nav className="container-page flex flex-col py-3" aria-label="Principal (mobile)">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-button px-2 py-3 font-body text-base font-medium text-ink-soft hover:bg-cream-200"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 px-2 pb-2 pt-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="btn-secondary flex-1 px-4 py-2.5 text-sm"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                onClick={() => setOpen(false)}
                className="btn-primary flex-1 px-4 py-2.5 text-sm"
              >
                Criar conta
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
