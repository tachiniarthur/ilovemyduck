import Link from "next/link";
import Reveal from "../Reveal";
import Icon from "../Icon";

/**
 * ── PREÇOS TEMPORÁRIOS ──────────────────────────────────────────────────
 * Todos os valores abaixo são FICTÍCIOS e provisórios. Para alterar, mude
 * apenas `price`, `period`, `note` e `features`. O plano com `featured: true`
 * é o destacado como recomendado. Não há cobrança real conectada ainda, cada
 * botão leva ao cadastro.
 */
interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  note?: string;
  features: string[];
  cta: string;
  featured?: boolean;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    id: "avulso",
    name: "Por vídeo",
    price: "R$ 2,90",
    period: "/ vídeo",
    tagline: "Pra fatiar um vídeo só, sem assinar nada.",
    features: ["1 vídeo", "Cortes de 15, 30 ou 60s", "100% no navegador"],
    cta: "Fatiar um vídeo",
  },
  {
    id: "semanal",
    name: "Semanal",
    price: "R$ 9,90",
    period: "/ semana",
    tagline: "Pra uma semana de posts em sequência.",
    features: ["Vídeos ilimitados por 7 dias", "Todos os tamanhos de corte", "Baixar tudo em ZIP"],
    cta: "Começar a semana",
  },
  {
    id: "mensal",
    name: "Mensal",
    price: "R$ 19,90",
    period: "/ mês",
    tagline: "O ritmo certo pra quem posta sempre.",
    features: [
      "Vídeos ilimitados",
      "Todos os tamanhos de corte",
      "Baixar tudo em ZIP",
      "Suporte do patinho 🦆",
    ],
    cta: "Assinar mensal",
    featured: true,
    badge: "Mais popular",
  },
  {
    id: "anual",
    name: "Anual",
    price: "R$ 149,90",
    period: "/ ano",
    note: "≈ R$ 12,49 / mês",
    tagline: "O melhor custo pra quem leva a sério.",
    features: ["Tudo do plano mensal", "Equivale a 2 meses grátis", "Suporte prioritário"],
    cta: "Assinar anual",
  },
];

export default function Pricing() {
  return (
    <section id="planos" className="container-page scroll-mt-24 pt-24 sm:pt-32">
      <div className="max-w-2xl">
        <Reveal as="p" className="eyebrow">
          <span className="slice-line h-px w-6" />
          Planos
        </Reveal>
        <Reveal as="h2" delay={60}>
          <span className="mt-4 block text-balance font-display text-display-lg font-semibold text-ink">
            Escolha o tamanho da ninhada
          </span>
        </Reveal>
        <Reveal as="p" delay={120}>
          <span className="mt-4 block text-pretty font-body text-lg leading-relaxed text-ink-muted">
            Do avulso ao anual. Cancele quando quiser e, em todos eles, o vídeo
            continua sendo processado só no seu aparelho.
          </span>
        </Reveal>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-center">
        {PLANS.map((plan, i) => (
          <Reveal
            key={plan.id}
            delay={i * 70}
            className={plan.featured ? "relative z-10" : ""}
          >
            <div
              className={`relative flex h-full flex-col rounded-card p-6 transition-shadow ${
                plan.featured
                  ? "border-2 border-bill-500 bg-cream-50 shadow-accent-lg lg:h-[31rem] lg:pt-9 lg:scale-[1.05]"
                  : "border border-bark-200 bg-cream-50/80 shadow-card lg:h-[27rem]"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-bill-600 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wide text-white shadow-accent">
                  <Icon name="sparkle" size={13} />
                  {plan.badge}
                </span>
              )}

              <h3 className="font-display text-lg font-semibold text-ink">
                {plan.name}
              </h3>
              <p className="mt-1 min-h-[2.5rem] text-pretty font-body text-sm leading-snug text-ink-muted">
                {plan.tagline}
              </p>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-semibold text-ink">
                  {plan.price}
                </span>
                <span className="font-mono text-xs text-ink-muted">{plan.period}</span>
              </div>
              {plan.note && (
                <p className="mt-1 font-mono text-xs text-pond-700">{plan.note}</p>
              )}

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 font-body text-sm text-ink-soft">
                    <span className="mt-0.5 shrink-0 text-pond-600">
                      <Icon name="check" size={16} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/cadastro"
                className={`mt-6 w-full px-4 py-3 text-sm ${
                  plan.featured ? "btn-primary" : "btn-secondary"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
