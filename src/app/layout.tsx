import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

// Display: a soft serif with editorial warmth and a little personality, the
// "fun but professional" voice. Body: a clean humanist sans for product-grade
// legibility. Mono: technical accents (eyebrows, step numbers, prices).
const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "I Love My Duck: Fatie seu vídeo para os Stories",
  description:
    "Transforme um vídeo longo em várias partes prontas para postar em sequência nos Stories do Instagram, direto no navegador. 100% privado: seu vídeo nunca sai do seu aparelho.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#fffaf2",
  width: "device-width",
  initialScale: 1,
  // Comfortable on mobile while still allowing pinch-zoom for a11y.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="bg-cream-100 font-body text-ink-soft antialiased">
        <ClerkProvider localization={ptBR}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}