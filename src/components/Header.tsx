import DuckMascot from "./DuckMascot";

export default function Header() {
  return (
    <header className="w-full">
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-3 px-4 pt-6 sm:pt-10">
        <DuckMascot size={56} mood="happy" className="shrink-0" />
        <div className="text-center">
          <h1 className="font-display text-2xl font-extrabold leading-none tracking-tight text-bill-600 sm:text-3xl">
            I Love My Duck
          </h1>
          <p className="font-body text-xs font-semibold text-duck-700/80 sm:text-sm">
            Fatie seu vídeo para os Stories 🦆
          </p>
        </div>
      </div>
    </header>
  );
}
