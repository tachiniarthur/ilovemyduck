import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Showcase from "@/components/landing/Showcase";
import Pricing from "@/components/landing/Pricing";
import FinalCta from "@/components/landing/FinalCta";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#conteudo"
        className="sr-only rounded-button bg-ink px-4 py-2 font-body text-sm text-cream-50 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60]"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo" className="flex-1 pb-4">
        <Hero />
        <HowItWorks />
        <Showcase />
        <Pricing />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
