import Reveal from "../Reveal";
import Icon from "../Icon";
import BrowserMockup from "../brand/BrowserMockup";

/**
 * ── ONDE TROCAR AS IMAGENS ──────────────────────────────────────────────
 * As capturas reais ficam em /public. Para trocar, substitua os arquivos
 * (ou ajuste `src`/`alt` abaixo). São capturas largas do app, por isso vão
 * dentro de uma moldura de navegador, não de celular.
 */
const SHOTS: {
  src: string;
  alt: string;
  caption: string;
  detail: string;
  objectPosition?: string;
}[] = [
  {
    src: "/img-1.png",
    alt: "Tela de seleção de vídeo do I Love My Duck",
    caption: "Solte o vídeo",
    detail:
      "Arraste qualquer vídeo longo para o patinho. Tudo acontece no seu aparelho, nada sobe para servidor nenhum.",
  },
  {
    src: "/img-2.png",
    alt: "Tela de ajuste do tamanho e dos pontos de corte",
    caption: "Ajuste os cortes",
    detail:
      "Escolha o tamanho de cada parte e refine os pontos de corte. A prévia mostra exatamente como cada Story vai ficar.",
  },
  {
    src: "/img-2.png",
    alt: "Botão para fatiar o vídeo em Stories",
    caption: "Clique pra fatiar",
    detail:
      "Com tudo ajustado, é só clicar no botão e o patinho fatia o vídeo em partes na hora.",
    objectPosition: "object-bottom",
  },
  {
    src: "/img-3.png",
    alt: "Tela com as partes geradas prontas para salvar",
    caption: "Salve os Stories",
    detail:
      "As partes saem prontas em sequência, numeradas e na ordem certa. É só salvar na galeria e postar.",
  },
];

export default function Showcase() {
  return (
    <section id="demonstracao" className="scroll-mt-24 pt-24 sm:pt-32">
      <div className="container-page">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <Reveal as="p" className="eyebrow">
              <span className="slice-line h-px w-6" />
              Demonstração
            </Reveal>
            <Reveal as="h2" delay={60}>
              <span className="mt-4 block text-balance font-display text-display-lg font-semibold text-ink">
                Veja o patinho fatiando na prática
              </span>
            </Reveal>
            <Reveal as="p" delay={120}>
              <span className="mt-4 block max-w-xl text-pretty font-body text-lg leading-relaxed text-ink-muted">
                Um passo a passo visual, do vídeo inteiro até os Stories prontos
                na galeria.
              </span>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <span className="inline-flex items-center gap-2 rounded-full bg-bill-500/10 px-3.5 py-1.5 font-mono text-xs text-bill-700">
              <Icon name="sparkle" size={15} />
              Telas reais do app
            </span>
          </Reveal>
        </div>

        {/* Each step alternates side so the wide captures breathe */}
        <div className="mt-16 flex flex-col gap-16 sm:gap-24">
          {SHOTS.map((shot, i) => {
            const flipped = i % 2 === 1;
            return (
              <Reveal key={shot.caption}>
                <figure
                  className={`grid items-center gap-8 lg:gap-12 ${
                    flipped
                      ? "lg:grid-cols-[1fr_auto]"
                      : "lg:grid-cols-[auto_1fr]"
                  }`}
                >
                  <figcaption
                    className={`max-w-sm ${flipped ? "lg:order-2" : ""}`}
                  >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-duck-100 font-mono text-sm font-semibold text-bill-700 ring-1 ring-bark-200">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-semibold text-ink">
                    {shot.caption}
                  </h3>
                  <p className="mt-2 font-body text-base leading-relaxed text-ink-muted">
                    {shot.detail}
                  </p>
                </figcaption>
                  <BrowserMockup
                    src={shot.src}
                    alt={shot.alt}
                    objectPosition={shot.objectPosition}
                    className={`w-full lg:min-w-[34rem] ${
                      flipped ? "lg:order-1" : ""
                    }`}
                  />
                </figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
