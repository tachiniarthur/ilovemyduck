export default function Footer() {
  return (
    <footer className="mt-16 w-full pb-10">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <p className="mx-auto max-w-sm text-pretty font-body text-xs leading-relaxed text-duck-700/70">
          Feito com 💛 e muitos quacks. Seu vídeo nunca sai do seu aparelho —
          tudo acontece aqui no navegador.
        </p>
        <p className="mt-2 font-body text-[11px] tracking-wide text-duck-700/50">
          I Love My Duck · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
