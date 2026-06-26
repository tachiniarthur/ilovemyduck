import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

/**
 * Traduz os erros do Clerk (que chegam em inglês na API) para mensagens claras
 * em português, mapeando pelo `code`. Códigos não mapeados caem no fallback,
 * que também já é PT, então o usuário nunca vê texto em inglês.
 */
const MESSAGES: Record<string, string> = {
  // Cadastro
  form_identifier_exists: "Este e-mail já está cadastrado. Tente entrar.",
  form_password_length_too_short:
    "Sua senha é muito curta. Use ao menos 8 caracteres.",
  form_password_pwned:
    "Essa senha apareceu em vazamentos conhecidos. Escolha outra.",
  form_password_validation_failed: "Senha inválida. Tente outra.",
  form_password_not_strong_enough:
    "Sua senha é fraca. Misture letras, números e símbolos.",

  // Formato de campos
  form_param_format_invalid: "Verifique se os dados estão no formato correto.",
  form_param_nil: "Preencha todos os campos.",
  form_param_missing: "Preencha todos os campos.",

  // Login
  form_password_incorrect: "Senha incorreta. Tente novamente.",
  form_identifier_not_found: "Não encontramos uma conta com esse e-mail.",
  account_not_found: "Não encontramos uma conta com esse e-mail.",
  strategy_for_user_invalid:
    "Esse método de login não está disponível para esta conta.",

  // Código de verificação / recuperação
  form_code_incorrect: "Código incorreto. Confira e tente de novo.",
  verification_failed: "Não foi possível verificar o código. Tente novamente.",
  verification_expired: "O código expirou. Solicite um novo.",
  verification_already_verified: "Este e-mail já foi verificado.",

  // Proteção / limites
  captcha_invalid:
    "Não conseguimos confirmar que você é humano. Recarregue a página e tente de novo.",
  captcha_unavailable:
    "A verificação anti-robô falhou. Recarregue a página e tente de novo.",
  too_many_requests:
    "Muitas tentativas em pouco tempo. Aguarde um instante e tente de novo.",

  // Sessão
  session_exists: "Você já está logado.",
  identifier_already_signed_in: "Você já está logado.",
};

export function translateClerkError(
  err: unknown,
  fallback = "Algo deu errado. Tente novamente.",
): string {
  if (!isClerkAPIResponseError(err)) return fallback;
  const first = err.errors[0];
  if (!first) return fallback;
  return MESSAGES[first.code] ?? fallback;
}
