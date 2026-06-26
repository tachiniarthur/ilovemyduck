"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import AuthNotice from "@/components/auth/AuthNotice";
import AuthDuck from "@/components/auth/AuthDuck";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import ButtonSpinner from "@/components/ButtonSpinner";
import { useAuthDuck } from "@/components/auth/useAuthDuck";
import { isEmail, isStrongEnough } from "@/lib/validation";
import { translateClerkError } from "@/lib/clerkErrors";

export default function CadastroPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  // "form" coleta os dados; "verify" pede o código enviado por e-mail.
  const [step, setStep] = useState<"form" | "verify">("form");
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const duck = useAuthDuck();

  const validate = () => {
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Como podemos te chamar?";
    if (!isEmail(email)) next.email = "Digite um e-mail válido.";
    if (!isStrongEnough(password)) next.password = "Use ao menos 6 caracteres.";
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
      await signUp.create({
        emailAddress: email,
        password,
        firstName: name.trim(),
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
      duck.reset();
    } catch (err) {
      setFormError(translateClerkError(err, "Não foi possível criar a conta."));
      duck.fail();
    } finally {
      setPending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(undefined);
    if (!isLoaded || pending) return;
    if (!code.trim()) {
      setFormError("Digite o código que enviamos para o seu e-mail.");
      duck.fail();
      return;
    }

    setPending(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        duck.succeed();
        router.push("/fatiar");
      } else {
        setFormError("Não foi possível confirmar o código. Tente novamente.");
        duck.fail();
      }
    } catch (err) {
      setFormError(translateClerkError(err, "Código inválido ou expirado."));
      duck.fail();
    } finally {
      setPending(false);
    }
  };

  const clear = (key: keyof typeof errors) => {
    duck.reset();
    return errors[key] && setErrors((p) => ({ ...p, [key]: undefined }));
  };

  if (step === "verify") {
    return (
      <AuthShell
        title="Confirme seu e-mail"
        subtitle={`Enviamos um código para ${email}. Digite-o abaixo para ativar sua conta.`}
        duck={<AuthDuck {...duck.duckProps} />}
        footer={
          <button
            type="button"
            onClick={() => {
              setStep("form");
              setCode("");
              setFormError(undefined);
              duck.reset();
            }}
            className="font-semibold text-bill-700 hover:underline"
          >
            Voltar
          </button>
        }
      >
        {formError && <AuthNotice tone="error" message={formError} />}

        <form onSubmit={handleVerify} noValidate className="space-y-4">
          <AuthField
            label="Código de verificação"
            icon="shield"
            placeholder="Ex.: 123456"
            autoComplete="one-time-code"
            value={code}
            onChange={(v) => {
              setCode(v);
              if (formError) setFormError(undefined);
              duck.notifyTyping();
            }}
            onFocus={() => duck.onFieldFocus("code")}
            onBlur={() => duck.onFieldBlur()}
          />

          <button
            type="submit"
            disabled={pending}
            className="btn-primary w-full px-4 py-3 text-base disabled:cursor-not-allowed disabled:opacity-70"
            {...duck.submitHoverHandlers}
          >
            {pending ? (
              <>
                <ButtonSpinner />
                Confirmando…
              </>
            ) : (
              "Confirmar e entrar"
            )}
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Crie sua conta"
      subtitle="É rapidinho, depois é só soltar o vídeo e fatiar."
      duck={<AuthDuck {...duck.duckProps} />}
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-bill-700 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      {formError && <AuthNotice tone="error" message={formError} />}

      <SocialAuthButtons mode="signUp" onError={setFormError} />

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
            duck.notifyTyping();
          }}
          onFocus={() => duck.onFieldFocus("name")}
          onBlur={() => {
            duck.onFieldBlur();
            setErrors((p) => ({
              ...p,
              name: name && name.trim().length < 2 ? "Como podemos te chamar?" : undefined,
            }));
          }}
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
          onFocus={() => duck.onFieldFocus("password")}
          onRevealChange={duck.onRevealChange}
          onBlur={() => {
            duck.onFieldBlur();
            setErrors((p) => ({
              ...p,
              password:
                password && !isStrongEnough(password)
                  ? "Use ao menos 6 caracteres."
                  : undefined,
            }));
          }}
          error={errors.password}
        />

        {/* Widget anti-bot do Clerk: invisível até existir um desafio. */}
        <div id="clerk-captcha" />

        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full px-4 py-3 text-base disabled:cursor-not-allowed disabled:opacity-70"
          {...duck.submitHoverHandlers}
        >
          {pending ? (
            <>
              <ButtonSpinner />
              Criando conta…
            </>
          ) : (
            "Criar conta"
          )}
        </button>

        <p className="text-center font-body text-xs leading-relaxed text-bark-500">
          Ao criar a conta, você concorda em deixar o patinho cuidar dos seus
          cortes. 🦆
        </p>
      </form>
    </AuthShell>
  );
}
