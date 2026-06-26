"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ComponentProps, ReactNode } from "react";
import ButtonSpinner from "./ButtonSpinner";

type SpinnerLinkProps = Omit<ComponentProps<typeof Link>, "href" | "onClick"> & {
  href: string;
  children: ReactNode;
  /** Executado antes de navegar (ex.: fechar o menu mobile). */
  onBeforeNavigate?: () => void;
};

/**
 * Link estilizado como botão que mostra um spinner enquanto a navegação está em
 * andamento. O App Router não dá feedback nativo entre o clique e a troca de
 * página (o `useLinkStatus` só existe no Next 15), então interceptamos o clique
 * esquerdo simples e navegamos dentro de um `useTransition` para saber quando a
 * próxima rota terminou de carregar. Cliques com modificador (nova aba, etc.)
 * caem no comportamento padrão do <Link>, preservando o href no <a>.
 */
export default function SpinnerLink({
  href,
  children,
  onBeforeNavigate,
  ...rest
}: SpinnerLinkProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Link
      href={href}
      aria-busy={pending}
      onClick={(e) => {
        // Deixa nova aba / nova janela / download seguirem o caminho normal.
        if (
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          e.button !== 0
        ) {
          return;
        }
        e.preventDefault();
        onBeforeNavigate?.();
        startTransition(() => router.push(href));
      }}
      {...rest}
    >
      {pending && <ButtonSpinner />}
      {children}
    </Link>
  );
}
