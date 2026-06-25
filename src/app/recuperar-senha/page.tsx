"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import AuthNotice from "@/components/auth/AuthNotice";
import AuthDuck from "@/components/auth/AuthDuck";
import { useAuthDuck } from "@/components/auth/useAuthDuck";
import { isEmail } from "@/lib/validation";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const duck = useAuthDuck("pensive");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    // TODO: plug real password recovery here (e.g. sendResetEmail(email)).
    if (!isEmail(email)) {
      setError("Digite um e-mail válido.");
      duck.fail();
      return;
    }
    setError(undefined);
    setSubmitted(true);
    duck.succeed();
  };

  return (
    <AuthShell
      title="Recuperar senha"
      subtitle="Informe seu e-mail e enviaremos um link para criar uma nova senha."
      duck={<AuthDuck {...duck.duckProps} />}
      footer={
        <>
          Lembrou a senha?{" "}
          <Link href="/login" className="font-semibold text-bill-700 hover:underline">
            Voltar ao login
          </Link>
        </>
      }
    >
      {submitted && (
        <AuthNotice message="Quack! Se a recuperação estivesse conectada, um link voaria para o seu e-mail agora mesmo." />
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField
          label="E-mail"
          type="email"
          icon="mail"
          placeholder="voce@email.com"
          autoComplete="email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            if (error) setError(undefined);
            duck.notifyTyping();
          }}
          onFocus={() => duck.onFieldFocus("email")}
          onBlur={() => {
            duck.onFieldBlur();
            setError(email && !isEmail(email) ? "Digite um e-mail válido." : undefined);
          }}
          error={error}
        />

        <button
          type="submit"
          className="btn-primary w-full px-4 py-3 text-base"
          {...duck.submitHoverHandlers}
        >
          Enviar link de recuperação
        </button>
      </form>
    </AuthShell>
  );
}
