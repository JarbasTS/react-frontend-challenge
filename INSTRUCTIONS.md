# Instruções — Libris

## Sobre o projeto

Este repositório é a implementação do case **Libris**: um gerenciador de biblioteca pessoal que
consome a Google Books API, com autenticação simulada, busca com filtros/paginação, estante
persistida e página de detalhes do livro.

## Pré-requisitos

- Node.js 20 ou superior (desenvolvido e testado com Node 22).
- [pnpm](https://pnpm.io/) 12 — o repositório já fixa a versão exata em `packageManager`
  (`package.json`); rodando `corepack enable`, o pnpm correto é baixado automaticamente ao usar
  qualquer comando `pnpm` abaixo.

## Instalação

```bash
pnpm install
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

A única variável, `VITE_GOOGLE_BOOKS_API_KEY`, é **opcional** — a Google Books API funciona sem
key para uso simples. Sem ela, o app roda normalmente, só sujeito a um rate limit mais agressivo
da própria API (ver `ARCHITECTURE.md`). Se precisar de uma, gere uma key gratuita no
[Google Cloud Console](https://console.cloud.google.com/) e cole no `.env.local`.

## Rodando em desenvolvimento

```bash
pnpm dev
```

Abre em `http://localhost:5173`.

## Rodando os testes

```bash
pnpm test              # modo watch
pnpm test:run          # roda uma vez e sai
pnpm test:coverage     # roda uma vez com relatório de cobertura
```

## Build de produção

```bash
pnpm build       # tsc -b && vite build — gera dist/
pnpm preview     # serve o build de dist/ localmente
```

## Credenciais de teste

O login é **simulado** — não há verificação real de credenciais. Use:

- **E-mail:** qualquer endereço em formato válido (ex.: `voce@exemplo.com`).
- **Senha:** qualquer texto com 7 ou mais caracteres.

A sessão persiste após recarregar a página (F5) até que você clique em "Sair".
