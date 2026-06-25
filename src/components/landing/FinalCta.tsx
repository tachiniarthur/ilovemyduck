import Link from "next/link";
import Reveal from "../Reveal";
import Icon from "../Icon";
import DuckGlyph from "../brand/DuckGlyph";

export default function FinalCta() {
  return (
    <section className="container-page pt-24 sm:pt-32">
      <Reveal>
        <div className="relative overflow-hidden rounded-[1.6rem] border border-bark-200 bg-gradient-to-br from-duck-100 via-cream-50 to-sky-200/40 px-7 py-12 shadow-card sm:px-12 sm:py-16">
          {/* A single perforation across the band keeps the slice signature */}
          <span
            aria-hidden
            className="slice-line absolute inset-x-8 top-0 hidden sm:block"
          />
          <div className="relative max-w-xl">
            <DuckGlyph size={72} />
            <h2 className="mt-5 text-balance font-display text-display-lg font-semibold text-ink">
              Pronto pra deixar o patinho{" "}
              <span className="italic text-bill-600">fatiar</span>?
            </h2>
            <p className="mt-4 text-pretty font-body text-lg leading-relaxed text-ink-muted">
              Abra o fatiador, solte um vídeo e poste sua sequência de Stories em
              minutos. Sem instalar nada, sem enviar nada.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/fatiar" className="btn-primary px-6 py-3.5 text-base">
                Fatiar meu vídeo
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link href="/cadastro" className="btn-secondary px-6 py-3.5 text-base">
                Criar uma conta
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
