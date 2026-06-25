import Link from "next/link";
import DuckLogo from "./brand/DuckLogo";
import Icon from "./Icon";

const COLUMNS = [
  {
    title: "Produto",
    links: [
      { label: "Como funciona", href: "/#como-funciona" },
      { label: "Demonstração", href: "/#demonstracao" },
      { label: "Planos", href: "/#planos" },
      { label: "Abrir o fatiador", href: "/fatiar" },
    ],
  },
  {
    title: "Conta",
    links: [
      { label: "Entrar", href: "/login" },
      { label: "Criar conta", href: "/cadastro" },
      { label: "Recuperar senha", href: "/recuperar-senha" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-bark-200/70 bg-cream-50/60">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-xs">
          <DuckLogo />
          <p className="mt-4 text-pretty font-body text-sm leading-relaxed text-ink-muted">
            Fatie vídeos longos em partes prontas para os Stories, direto no
            navegador. Seu vídeo nunca sai do seu aparelho. Feito com 💛 e muitos
            quacks.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-pond-300/30 px-3 py-1.5 font-mono text-xs text-pond-700 ring-1 ring-pond-400/30">
            <Icon name="shield" size={15} />
            100% no seu aparelho
          </p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="font-mono text-eyebrow font-medium uppercase text-ink-muted">
              {col.title}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded font-body text-sm text-ink-soft transition-colors hover:text-bill-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-bark-200/70">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-5 sm:flex-row sm:items-center">
          <p className="font-body text-xs text-ink-muted">
            © {new Date().getFullYear()} I Love My Duck · Todos os patinhos
            reservados
          </p>
          <p className="font-mono text-xs text-bark-400">Quack quack 🦆</p>
        </div>
      </div>
    </footer>
  );
}
