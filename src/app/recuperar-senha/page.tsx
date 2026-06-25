"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import AuthNotice from "@/components/auth/AuthNotice";
import { isEmail } from "@/lib/validation";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    // TODO: plug real password recovery here (e.g. sendResetEmail(email)).
    if (!isEmail(email)) {
      setError("Digite um e-mail válido.");
      return;
    }
    setError(undefined);
    setSubmitted(true);
  };

  return (
    <AuthShell
      title="Recuperar senha"
      subtitle="Informe seu e-mail e enviaremos um link para criar uma nova senha."
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
          }}
          onBlur={() =>
            setError(email && !isEmail(email) ? "Digite um e-mail válido." : undefined)
          }
          error={error}
        />

        <button type="submit" className="btn-primary w-full px-4 py-3 text-base">
          Enviar link de recuperação
        </button>
      </form>
    </AuthShell>
  );
}
