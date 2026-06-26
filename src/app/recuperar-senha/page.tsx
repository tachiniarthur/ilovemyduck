"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import AuthNotice from "@/components/auth/AuthNotice";
import AuthDuck from "@/components/auth/AuthDuck";
import ButtonSpinner from "@/components/ButtonSpinner";
import { useAuthDuck } from "@/components/auth/useAuthDuck";
import { isEmail, isStrongEnough } from "@/lib/validation";
import { translateClerkError } from "@/lib/clerkErrors";

export default function RecuperarSenhaPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  // "request" envia o código; "reset" troca a senha com código + nova senha.
  const [step, setStep] = useState<"request" | "reset">("request");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [resetErrors, setResetErrors] = useState<{ code?: string; password?: string }>({});
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | undefined>();
  const [pending, setPending] = useState(false);
  const duck = useAuthDuck("pensive");

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(undefined);
    if (!isEmail(email)) {
      setEmailError("Digite um e-mail válido.");
      duck.fail();
      return;
    }
    if (!isLoaded || pending) return;

    setPending(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("reset");
      setNotice({
        tone: "success",
        message: "Quack! Enviamos um código para o seu e-mail. Use-o abaixo para criar uma nova senha.",
      });
      duck.reset();
    } catch (err) {
      setNotice({ tone: "error", message: translateClerkError(err, "Não foi possível enviar o código.") });
      duck.fail();
    } finally {
      setPending(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(undefined);
    const next: typeof resetErrors = {};
    if (!code.trim()) next.code = "Digite o código recebido.";
    if (!isStrongEnough(password)) next.password = "Use ao menos 6 caracteres.";
    setResetErrors(next);
    if (Object.keys(next).length > 0) {
      duck.fail();
      return;
    }
    if (!isLoaded || pending) return;

    setPending(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        duck.succeed();
        router.push("/fatiar");
      } else {
        setNotice({ tone: "error", message: "Não foi possível redefinir a senha. Tente novamente." });
        duck.fail();
      }
    } catch (err) {
      setNotice({ tone: "error", message: translateClerkError(err, "Código inválido ou expirado.") });
      duck.fail();
    } finally {
      setPending(false);
    }
  };

  if (step === "reset") {
    return (
      <AuthShell
        title="Crie uma nova senha"
        subtitle={`Digite o código que enviamos para ${email} e escolha uma nova senha.`}
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
        {notice && <AuthNotice tone={notice.tone} message={notice.message} />}

        <form onSubmit={handleReset} noValidate className="space-y-4">
          <AuthField
            label="Código de verificação"
            icon="shield"
            placeholder="Ex.: 123456"
            autoComplete="one-time-code"
            value={code}
            onChange={(v) => {
              setCode(v);
              if (resetErrors.code) setResetErrors((p) => ({ ...p, code: undefined }));
              duck.notifyTyping();
            }}
            onFocus={() => duck.onFieldFocus("code")}
            onBlur={() => duck.onFieldBlur()}
            error={resetErrors.code}
          />

          <AuthField
            label="Nova senha"
            type="password"
            icon="lock"
            placeholder="Crie uma nova senha"
            autoComplete="new-password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (resetErrors.password) setResetErrors((p) => ({ ...p, password: undefined }));
            }}
            onFocus={() => duck.onFieldFocus("password")}
            onRevealChange={duck.onRevealChange}
            onBlur={() => {
              duck.onFieldBlur();
              setResetErrors((p) => ({
                ...p,
                password:
                  password && !isStrongEnough(password) ? "Use ao menos 6 caracteres." : undefined,
              }));
            }}
            error={resetErrors.password}
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
                Redefinindo…
              </>
            ) : (
              "Redefinir senha"
            )}
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Recuperar senha"
      subtitle="Informe seu e-mail e enviaremos um código para criar uma nova senha."
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
      {notice && <AuthNotice tone={notice.tone} message={notice.message} />}

      <form onSubmit={handleRequest} noValidate className="space-y-4">
        <AuthField
          label="E-mail"
          type="email"
          icon="mail"
          placeholder="voce@email.com"
          autoComplete="email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            if (emailError) setEmailError(undefined);
            duck.notifyTyping();
          }}
          onFocus={() => duck.onFieldFocus("email")}
          onBlur={() => {
            duck.onFieldBlur();
            setEmailError(email && !isEmail(email) ? "Digite um e-mail válido." : undefined);
          }}
          error={emailError}
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
              Enviando…
            </>
          ) : (
            "Enviar código de recuperação"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
