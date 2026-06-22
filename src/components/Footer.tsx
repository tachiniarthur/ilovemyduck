export default function Footer() {
  return (
    <footer className="mt-12 w-full pb-8">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <p className="font-body text-xs text-duck-700/70">
          Feito com 💛 e muitos quacks. Seu vídeo nunca sai do seu aparelho —
          tudo acontece aqui no navegador.
        </p>
        <p className="mt-1 font-body text-[11px] text-duck-700/50">
          I Love My Duck · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
