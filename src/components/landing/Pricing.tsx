import Reveal from "../Reveal";
import Icon from "../Icon";

/**
 * Seção de planos da landing. Versão estática/visual: mostra os planos mensal e
 * anual com os valores e o destaque de economia do anual. Os botões de assinar
 * são placeholders, sem ação de pagamento — o checkout (Stripe puro) será
 * conectado depois, em outra etapa.
 */

interface StaticPlan {
  name: string;
  tagline: string;
  price: string;
  period: string;
  note?: string;
  features: string[];
  cta: string;
  featured?: boolean;
  badge?: string;
}

const PLANS: StaticPlan[] = [
  {
    name: "Mensal",
    tagline: "O ritmo certo pra quem posta sempre.",
    price: "$3.50",
    period: "/ mês",
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
    name: "Anual",
    tagline: "O melhor custo pra quem leva a sério.",
    price: "$35.04",
    period: "/ ano",
    note: "equivale a cerca de $2.92 / mês",
    features: [
      "Tudo do plano mensal",
      "Mais barato no mês que o mensal",
      "Suporte prioritário",
    ],
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
            Do mensal ao anual. Cancele quando quiser e, nos dois, o vídeo
            continua sendo processado só no seu aparelho.
          </span>
        </Reveal>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mx-auto lg:max-w-3xl lg:items-center">
        {PLANS.map((plan, i) => (
          <Reveal
            key={plan.name}
            delay={i * 70}
            className={plan.featured ? "relative z-10" : ""}
          >
            <div
              className={`relative flex h-full flex-col rounded-card p-6 transition-shadow ${
                plan.featured
                  ? "border-2 border-bill-500 bg-cream-50 shadow-accent-lg lg:h-[31rem] lg:pt-9 lg:scale-[1.03]"
                  : "border border-bark-200 bg-cream-50/80 shadow-card lg:h-[29rem]"
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
                <span className="font-mono text-xs text-ink-muted">
                  {plan.period}
                </span>
              </div>
              {plan.note && (
                <p className="mt-1 font-mono text-xs text-pond-700">{plan.note}</p>
              )}

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 font-body text-sm text-ink-soft"
                  >
                    <span className="mt-0.5 shrink-0 text-pond-600">
                      <Icon name="check" size={16} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Placeholder: sem ação de pagamento por enquanto. O checkout
                  (Stripe puro) será conectado em outra etapa. */}
              <button
                type="button"
                aria-disabled="true"
                title="Em breve"
                className={`mt-6 w-full px-4 py-3 text-sm ${
                  plan.featured ? "btn-primary" : "btn-secondary"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
