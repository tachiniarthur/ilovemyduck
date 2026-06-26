import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Rotas que NÃO exigem login: landing, telas de auth e callback do OAuth.
const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/cadastro(.*)",
  "/recuperar-senha(.*)",
  "/sso-callback(.*)",
]);

// Telas que um usuário JÁ logado não deve ver (landing + entrada de auth).
// Ele é mandado direto para a ferramenta.
const isAuthEntryRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/cadastro(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  if (userId && isAuthEntryRoute(request)) {
    return NextResponse.redirect(new URL("/fatiar", request.url));
  }

  // O fatiador exige apenas login (a cobrança será reimplementada depois). Toda
  // rota não pública pede autenticação.
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
