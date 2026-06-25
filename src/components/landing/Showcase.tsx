import Reveal from "../Reveal";
import Icon from "../Icon";
import PhoneMockup from "../brand/PhoneMockup";

/**
 * ── ONDE TROCAR AS IMAGENS ──────────────────────────────────────────────
 * Quando tiver as capturas reais do app, coloque os arquivos em /public e
 * preencha `src` (e `alt`) abaixo. Enquanto `src` ficar vazio, aparece um
 * placeholder elegante. Nada mais precisa mudar.
 */
const SHOTS: { src?: string; alt: string; caption: string; offset: string }[] = [
  {
    src: undefined, // ex.: "/screenshots/01-upload.png"
    alt: "Tela de seleção de vídeo do I Love My Duck",
    caption: "Solte o vídeo",
    offset: "sm:mt-10",
  },
  {
    src: undefined, // ex.: "/screenshots/02-cortes.png"
    alt: "Tela de ajuste dos pontos de corte",
    caption: "Ajuste os cortes",
    offset: "sm:mt-0",
  },
  {
    src: undefined, // ex.: "/screenshots/03-partes.png"
    alt: "Tela com as partes geradas prontas para salvar",
    caption: "Salve os Stories",
    offset: "sm:mt-16",
  },
];

export default function Showcase() {
  return (
    <section
      id="demonstracao"
      className="scroll-mt-24 pt-24 sm:pt-32"
    >
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
              Prévia simulada
            </span>
          </Reveal>
        </div>

        {/* Asymmetric mockup row, varied vertical offsets, not a flat grid */}
        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-10">
          {SHOTS.map((shot, i) => (
            <Reveal key={shot.caption} delay={i * 90} className={shot.offset}>
              <figure>
                <PhoneMockup src={shot.src} alt={shot.alt} />
                <figcaption className="mt-5 flex items-center justify-center gap-2 font-body text-sm text-ink-soft">
                  <span className="font-mono text-xs text-bark-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {shot.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
