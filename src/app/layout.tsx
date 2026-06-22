import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const display = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "I Love My Duck 🦆 — Fatie seu vídeo para os Stories",
  description:
    "Quebre vídeos longos em partes prontas para os Stories do Instagram, direto no navegador. 100% privado: seu vídeo nunca sai do seu aparelho.",
};

export const viewport: Viewport = {
  themeColor: "#f7b500",
  width: "device-width",
  initialScale: 1,
  // Keep the layout comfortable on mobile while allowing pinch-zoom for a11y.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body className="font-body text-duck-700 antialiased">{children}</body>
    </html>
  );
}
