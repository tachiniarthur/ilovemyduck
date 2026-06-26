"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * Destino do retorno do OAuth (Google/Apple). O componente do Clerk finaliza a
 * sessão e redireciona; mostramos só um aviso on-brand enquanto isso acontece.
 */
export default function SSOCallbackPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-cream-100 px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          aria-hidden="true"
          className="h-9 w-9 animate-spin rounded-full border-2 border-bark-200 border-t-bill-600"
        />
        <p className="font-display text-xl font-semibold text-ink">
          Entrando… 🦆
        </p>
        <p className="font-body text-sm text-ink-muted">
          Só um instante enquanto o patinho confere sua conta.
        </p>
      </div>

      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/fatiar"
        signUpFallbackRedirectUrl="/fatiar"
      />
    </div>
  );
}
