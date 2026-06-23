# I Love My Duck 🦆

Fatie um vídeo longo em várias partes prontas para postar em sequência nos
**Stories do Instagram** — direto no navegador, sem editor complicado.

> 🔒 **100% privado:** o vídeo é processado inteiramente no seu aparelho com
> [FFmpeg.wasm](https://ffmpegwasm.netlify.app/). Nada é enviado para servidor
> nenhum.

## ✨ O que ele faz

- Upload por **arrastar e soltar** ou clique (MP4, MOV, WebM).
- Preview do vídeo + duração total.
- Escolha o tamanho de cada parte: **15s** (padrão), **30s** ou **60s**, com
  contagem em tempo real de quantas partes serão geradas.
- Corte **rápido por cópia de stream** (`-c copy` + *segment muxer*): nada é
  reencodado, então até vídeos longos fatiam em segundos. A divisão cai no
  keyframe mais próximo, então cada parte já começa num quadro válido — sem
  início preto/travado.
- **Linha do tempo de cortes:** arraste, adicione ou remova os pontos de corte
  para não cortar no meio de uma fala.
- As partes vão **aparecendo conforme ficam prontas** (saída progressiva).
- Cada parte vira um card com mini preview, número e duração, nomeada de forma
  ordenada (`i-love-my-duck-parte-01.mp4`, `-02`, …).

> ⚡ Para inputs que o muxer de cópia não aceita (comum em `.mov` HEVC do
> iPhone), há um **fallback** que reencoda cada parte para H.264/AAC mantendo o
> enquadramento original. O corte simples por cópia permanece instantâneo.
- **Salvar na galeria** via Web Share API no celular (iOS/Android) ou download
  no desktop. Também dá para baixar tudo em um **ZIP**.

## 🏗️ Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **@ffmpeg/ffmpeg** + **@ffmpeg/util** (processamento client-side)
- **JSZip** (download em lote)

## ⚠️ Detalhe crítico: cabeçalhos de isolamento

FFmpeg.wasm depende de `SharedArrayBuffer`, que o navegador só habilita quando a
página está *cross-origin isolated*. Por isso o `next.config.mjs` envia em
**todas as rotas**:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

As fontes são auto-hospedadas (`next/font`) e o core **single-thread**
(`@ffmpeg/core`) do FFmpeg é carregado via `toBlobURL` (core + wasm — o core ST
não tem `worker.js`), o que o mantém compatível com o `require-corp`. A
instância é carregada uma única vez (com timeout + `AbortSignal`, para nunca
ficar travada caso o worker morra durante a inicialização) e reutilizada entre
operações.

> ℹ️ Optamos pelo core single-thread em vez do `@ffmpeg/core-mt`: o caminho
> padrão de corte é uma **cópia de stream**, já quase instantânea sem
> multi-threading, e o pool de pthreads do core MT podia falhar na
> inicialização sem disparar erro, deixando a barra travada em 0%. Os
> cabeçalhos COOP/COEP acima continuam sendo enviados (não custam nada e
> deixam a porta aberta para reativar o MT no futuro).

## 🚀 Rodando localmente

```bash
npm install
npm run dev     # http://localhost:3000
```

Build de produção:

```bash
npm run build
npm run start
```

## 📁 Estrutura

```
src/
├── app/                 # layout, página principal, estilos globais
├── components/          # UI (upload, preview, controles, resultados, mascote…)
├── lib/
│   ├── ffmpeg.ts        # carga + fatiamento com o segment muxer
│   ├── share.ts         # Web Share API + fallback de download
│   ├── zip.ts           # empacotamento em ZIP
│   ├── video.ts         # leitura de metadados do vídeo
│   ├── environment.ts   # detecção de iOS/Android/desktop e capacidades
│   └── format.ts        # formatação de tempo/tamanho e contagem de partes
└── types.ts
```

## 📱 Notas de mobile

- No iPhone/Android o botão **Salvar** abre a folha de compartilhamento nativa;
  o usuário escolhe *"Salvar vídeo"* (iOS) / *"Salvar na galeria"* (Android).
- No celular priorizamos salvar parte por parte (iOS não lida bem com ZIP indo
  para a galeria). O ZIP é a conveniência principal do desktop.
- Vídeos muito grandes podem estourar a memória do Safari iOS — o app avisa de
  forma amigável e sugere um vídeo menor ou cortes maiores, sem quebrar.

Feito com 💛 e muitos quacks.
