import Reveal from "../Reveal";
import Icon, { type IconName } from "../Icon";

const STEPS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "upload",
    title: "Escolha o vídeo",
    body: "Arraste um MP4, MOV ou WebM, ou toque para selecionar. Ele é aberto direto no navegador, sem upload.",
  },
  {
    icon: "sliders",
    title: "Defina a duração das partes",
    body: "15s, 30s ou 60s por parte. O patinho calcula na hora em quantos Stories o seu vídeo vai virar.",
  },
  {
    icon: "scissors",
    title: "Ajuste os pontos de corte",
    body: "Arraste as alcinhas na linha do tempo para não cortar no meio de uma fala. Adicione ou remova cortes à vontade.",
  },
  {
    icon: "download",
    title: "Fatie e salve na galeria",
    body: "Um toque e cada parte fica pronta, numerada na ordem certa, pronta para salvar e postar em sequência.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="container-page scroll-mt-24 pt-24 sm:pt-32">
      <div className="ml-auto max-w-2xl text-right">
        <Reveal as="p" className="eyebrow">
          Como funciona
          <span className="slice-line h-px w-6" />
        </Reveal>
        <Reveal as="h2" delay={60}>
          <span className="mt-4 block text-balance font-display text-display-lg font-semibold text-ink">
            Do vídeo cru aos Stories em quatro passos
          </span>
        </Reveal>
        <Reveal as="p" delay={120}>
          <span className="ml-auto mt-4 block text-pretty font-body text-lg leading-relaxed text-ink-muted">
            É um fluxo sequencial, cada passo prepara o próximo. Nenhum deles
            envia seu vídeo para lugar nenhum.
          </span>
        </Reveal>
      </div>

      {/* Numbered rail, content sits on the right, mirrored along the slice line */}
      <ol className="ml-auto mt-14 max-w-3xl">
        {STEPS.map((step, i) => {
          const last = i === STEPS.length - 1;
          return (
            <Reveal as="li" key={step.title} delay={i * 80}>
              <div className="relative grid grid-cols-[1fr_auto] gap-x-5 sm:gap-x-7">
                {/* Content */}
                <div className={last ? "pb-0" : "pb-12"}>
                  <div className="flex items-center justify-end gap-2.5">
                    <h3 className="font-display text-xl font-semibold text-ink">
                      {step.title}
                    </h3>
                    <span className="text-bill-600">
                      <Icon name={step.icon} size={20} />
                    </span>
                  </div>
                  <p className="ml-auto mt-2 max-w-md text-pretty text-right font-body leading-relaxed text-ink-muted">
                    {step.body}
                  </p>
                </div>

                {/* Node + connector */}
                <div className="flex flex-col items-center">
                  <span className="z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-bark-200 bg-cream-50 font-mono text-sm font-medium text-bill-700 shadow-button">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {!last && <span className="slice-line-v my-1 flex-1" />}
                </div>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}
