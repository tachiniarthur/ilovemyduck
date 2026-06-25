import Link from "next/link";
import Icon from "../Icon";
import Reveal from "../Reveal";
import StoryStrip from "../brand/StoryStrip";

export default function Hero() {
  return (
    <section className="container-page relative pt-14 sm:pt-20 lg:pt-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Copy, deliberately left-aligned, not a centred stack */}
        <div className="max-w-xl">
          <Reveal as="p" className="eyebrow">
            <span className="slice-line h-px w-6" />
            Fatiador de vídeos para Stories
          </Reveal>

          <Reveal as="h1" delay={60}>
            <span className="mt-5 block text-balance font-display text-display-xl font-semibold text-ink">
              Um vídeo longo vira vários{" "}
              <span className="italic text-bill-600">Stories</span> prontos pra
              postar.
            </span>
          </Reveal>

          <Reveal as="p" delay={120}>
            <span className="mt-5 block max-w-lg text-pretty font-body text-lg leading-relaxed text-ink-muted">
              O I Love My Duck corta seu vídeo em partes na duração certa e na
              sequência certa para o Instagram, tudo no seu navegador. Nada é
              enviado para servidor nenhum.
            </span>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/fatiar" className="btn-primary px-6 py-3.5 text-base">
                Fatiar meu vídeo
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link
                href="#como-funciona"
                className="btn-secondary px-6 py-3.5 text-base"
              >
                Ver como funciona
              </Link>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-7 inline-flex items-center gap-2.5 font-body text-sm text-ink-soft">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-pond-300/40 text-pond-700">
                <Icon name="shield" size={16} />
              </span>
              <span>
                <span className="font-semibold text-ink">100% privado:</span> seu
                vídeo nunca sai do seu aparelho.
              </span>
            </p>
          </Reveal>
        </div>

        {/* Signature visual */}
        <Reveal delay={120} className="lg:pl-4">
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-duck-200/40 via-transparent to-sky-200/40 blur-2xl"
            />
            <StoryStrip />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
