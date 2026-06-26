"use client";

import { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import ButtonSpinner from "@/components/ButtonSpinner";

type OAuthStrategy = "oauth_google" | "oauth_apple";

/**
 * Botões de login social no visual das telas (não os componentes prontos do
 * Clerk). Dispara o fluxo OAuth headless via authenticateWithRedirect, tanto
 * para login (mode="signIn") quanto para cadastro (mode="signUp"). O Clerk
 * trata contas novas e existentes no mesmo fluxo, então ambos os modos levam
 * o usuário direto para a ferramenta ao final.
 */
export default function SocialAuthButtons({
  mode,
  onError,
}: {
  mode: "signIn" | "signUp";
  onError?: (message: string) => void;
}) {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const [pending, setPending] = useState<OAuthStrategy | null>(null);

  const start = async (strategy: OAuthStrategy) => {
    if (pending) return;
    const ready = mode === "signIn" ? signInLoaded : signUpLoaded;
    if (!ready) return;

    setPending(strategy);
    try {
      const resource = mode === "signIn" ? signIn : signUp;
      await resource!.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/fatiar",
      });
      // Em caso de sucesso o navegador é redirecionado, nada a fazer aqui.
    } catch {
      setPending(null);
      onError?.(
        "Não foi possível iniciar o login social. Tente novamente.",
      );
    }
  };

  return (
    <div>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => start("oauth_google")}
          disabled={pending !== null}
          className="btn-secondary w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending === "oauth_google" ? <ButtonSpinner /> : <GoogleIcon />}
          {pending === "oauth_google" ? "Conectando…" : "Continuar com Google"}
        </button>

        <button
          type="button"
          onClick={() => start("oauth_apple")}
          disabled={pending !== null}
          className="btn-secondary w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending === "oauth_apple" ? <ButtonSpinner /> : <AppleIcon />}
          {pending === "oauth_apple" ? "Conectando…" : "Continuar com Apple"}
        </button>
      </div>

      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="slice-line h-px flex-1" />
        <span className="font-body text-xs font-medium text-bark-400">
          ou continue com e-mail
        </span>
        <span className="slice-line h-px flex-1" />
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.36 12.78c-.02-2.2 1.8-3.26 1.88-3.31-1.02-1.5-2.62-1.71-3.18-1.73-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.18-1.54 2.67-.39 6.62 1.1 8.79.73 1.06 1.6 2.25 2.74 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.08 2.65-2.14.84-1.23 1.18-2.42 1.2-2.48-.03-.01-2.29-.88-2.31-3.49ZM14.18 6.1c.6-.74 1.01-1.75.9-2.77-.87.04-1.94.59-2.57 1.32-.56.64-1.05 1.68-.92 2.67.97.08 1.97-.49 2.59-1.22Z" />
    </svg>
  );
}
