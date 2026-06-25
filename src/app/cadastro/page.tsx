"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import AuthNotice from "@/components/auth/AuthNotice";
import { isEmail, isStrongEnough } from "@/lib/validation";

export default function CadastroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Como podemos te chamar?";
    if (!isEmail(email)) next.email = "Digite um e-mail válido.";
    if (!isStrongEnough(password)) next.password = "Use ao menos 6 caracteres.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    // TODO: plug real account creation here (e.g. signUp({ name, email, password })).
    if (validate()) setSubmitted(true);
  };

  const clear = (key: keyof typeof errors) =>
    errors[key] && setErrors((p) => ({ ...p, [key]: undefined }));

  return (
    <AuthShell
      title="Crie sua conta"
      subtitle="É rapidinho, depois é só soltar o vídeo e fatiar."
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-bill-700 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      {submitted && (
        <AuthNotice message="Quack! Cadastro validado visualmente, falta só conectar o backend de verdade." />
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField
          label="Nome"
          icon="user"
          placeholder="Seu nome"
          autoComplete="name"
          value={name}
          onChange={(v) => {
            setName(v);
            clear("name");
          }}
          onBlur={() =>
            setErrors((p) => ({
              ...p,
              name: name && name.trim().length < 2 ? "Como podemos te chamar?" : undefined,
            }))
          }
          error={errors.name}
        />

        <AuthField
          label="E-mail"
          type="email"
          icon="mail"
          placeholder="voce@email.com"
          autoComplete="email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            clear("email");
          }}
          onBlur={() =>
            setErrors((p) => ({
              ...p,
              email: email && !isEmail(email) ? "Digite um e-mail válido." : undefined,
            }))
          }
          error={errors.email}
        />

        <AuthField
          label="Senha"
          type="password"
          icon="lock"
          placeholder="Crie uma senha"
          autoComplete="new-password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            clear("password");
          }}
          onBlur={() =>
            setErrors((p) => ({
              ...p,
              password:
                password && !isStrongEnough(password)
                  ? "Use ao menos 6 caracteres."
                  : undefined,
            }))
          }
          error={errors.password}
        />

        <button type="submit" className="btn-primary w-full px-4 py-3 text-base">
          Criar conta
        </button>

        <p className="text-center font-body text-xs leading-relaxed text-bark-500">
          Ao criar a conta, você concorda em deixar o patinho cuidar dos seus
          cortes. 🦆
        </p>
      </form>
    </AuthShell>
  );
}
