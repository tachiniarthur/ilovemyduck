"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import AuthNotice from "@/components/auth/AuthNotice";
import AuthDuck from "@/components/auth/AuthDuck";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import ButtonSpinner from "@/components/ButtonSpinner";
import { useAuthDuck } from "@/components/auth/useAuthDuck";
import { isEmail } from "@/lib/validation";
import { translateClerkError } from "@/lib/clerkErrors";

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const duck = useAuthDuck();

  const validate = () => {
    const next: typeof errors = {};
    if (!isEmail(email)) next.email = "Digite um e-mail válido.";
    if (!password) next.password = "Digite sua senha.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(undefined);
    if (!validate()) {
      duck.fail();
      return;
    }
    if (!isLoaded || pending) return;

    setPending(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        duck.succeed();
        router.push("/fatiar");
      } else {
        // Fluxos extras (ex.: MFA) não são cobertos por estas telas.
        setFormError("Não foi possível concluir o login. Tente novamente.");
        duck.fail();
      }
    } catch (err) {
      setFormError(translateClerkError(err, "E-mail ou senha incorretos."));
      duck.fail();
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell
      title="Bem-vindo de volta 🦆"
      subtitle="Entre para continuar fatiando seus vídeos."
      duck={<AuthDuck {...duck.duckProps} />}
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-bill-700 hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      {formError && <AuthNotice tone="error" message={formError} />}

      <SocialAuthButtons mode="signIn" onError={setFormError} />

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
            duck.notifyTyping();
          }}
          onFocus={() => duck.onFieldFocus("email")}
          onBlur={() => {
            duck.onFieldBlur();
            setErrors((p) => ({
              ...p,
              email: email && !isEmail(email) ? "Digite um e-mail válido." : undefined,
            }));
          }}
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
              duck.reset();
            }}
            onFocus={() => duck.onFieldFocus("password")}
            onBlur={() => duck.onFieldBlur()}
            onRevealChange={duck.onRevealChange}
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

        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full px-4 py-3 text-base disabled:cursor-not-allowed disabled:opacity-70"
          {...duck.submitHoverHandlers}
        >
          {pending ? (
            <>
              <ButtonSpinner />
              Entrando…
            </>
          ) : (
            "Entrar"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
