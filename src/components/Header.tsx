import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 px-4 pt-6 sm:pt-10">
        {/* The logo image already includes the "I Love My Duck" wordmark, so the
            heading is kept for semantics/SEO while the mark carries it visually. */}
        <h1 className="sr-only">I Love My Duck</h1>
        <div className="rounded-4xl bg-white/90 p-3 shadow-soft ring-1 ring-duck-200 sm:p-4">
          <Image
            src="/logo.png"
            alt="I Love My Duck"
            width={1254}
            height={1254}
            priority
            className="h-28 w-28 object-contain sm:h-36 sm:w-36"
          />
        </div>
        <p className="font-body text-xs font-semibold text-duck-700/80 sm:text-sm">
          Fatie seu vídeo para os Stories 🦆
        </p>
      </div>
    </header>
  );
}
