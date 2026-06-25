"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import AuthNotice from "@/components/auth/AuthNotice";
import { isEmail } from "@/lib/validation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!isEmail(email)) next.email = "Digite um e-mail válido.";
    if (!password) next.password = "Digite sua senha.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    // TODO: plug real authentication here (e.g. signIn({ email, password })).
    if (validate()) setSubmitted(true);
  };

  return (
    <AuthShell
      title="Bem-vindo de volta 🦆"
      subtitle="Entre para continuar fatiando seus vídeos."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-bill-700 hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      {submitted && (
        <AuthNotice message="Quack! O visual está pronto, a autenticação de verdade ainda não está conectada." />
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
            if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
          }}
          onBlur={() =>
            setErrors((p) => ({
              ...p,
              email: email && !isEmail(email) ? "Digite um e-mail válido." : undefined,
            }))
          }
          error={errors.email}
        />

        <div>
          <AuthField
            label="Senha"
            type="password"
            icon="lock"
            placeholder="Sua senha"
            autoComplete="current-password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
            }}
            error={errors.password}
          />
          <div className="mt-2 text-right">
            <Link
              href="/recuperar-senha"
              className="font-body text-xs font-medium text-bill-700 hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full px-4 py-3 text-base">
          Entrar
        </button>
      </form>
    </AuthShell>
  );
}
