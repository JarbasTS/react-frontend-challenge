# Arquitetura — Libris

## Estrutura de pastas

O projeto segue uma adaptação pragmática do **Feature-Sliced Design (FSD)**:

```
src/
  app/            # bootstrap: providers (QueryClient, ThemeProvider), router, layout raiz
  pages/          # composição de rotas (login, search, shelf, book-details)
  widgets/        # blocos compostos reutilizáveis (BookCard, ShelfTable)
  features/       # ações de negócio (auth, book-search, shelf)
  entities/       # modelos de domínio + adapters (book, shelf)
  shared/         # api client, ui kit (shadcn), lib (hooks/stores genéricos)
```

**Regra de dependência:** uma camada só importa de camadas iguais ou abaixo dela na lista acima
(`app > pages > widgets > features > entities > shared`). `shared` não conhece `entities`,
`entities` não conhece `features`, e assim por diante. Isso mantém a lógica de negócio
(`entities`, `features`) isolada de detalhes de composição de tela (`pages`, `widgets`), o que
facilita testar cada camada isoladamente (é por isso que quase toda a suíte de testes mocka
apenas a camada imediatamente abaixo da que está sendo testada, nunca a rede diretamente).

A adaptação em relação ao FSD "de livro" é deliberada: não há camada vazia criada só por
completude (por exemplo, não existe `entities/user` — a sessão é tratada inteiramente em
`features/auth`, já que não há um "usuário" com dados além do e-mail). O critério foi
escalabilidade e isolamento de regra de negócio, não aderência ao dogma da metodologia.

## Autenticação sem backend

Não existe backend — a autenticação é inteiramente simulada no cliente, e isso é uma
**exigência do case**, não uma falha de segurança a esconder:

1. **Validação do formulário** (`features/auth/model/login-schema.ts`): Zod exige um e-mail
   válido e uma senha com 7+ caracteres. Nenhuma credencial é verificada contra nada — qualquer
   par que passe nessas duas regras é aceito.
2. **Sessão fake** (`features/auth/model/auth-store.ts`): ao fazer login, a store Zustand gera um
   token fictício via `crypto.randomUUID()` e guarda `{ user: { email }, token }`. O middleware
   `persist` do Zustand grava esse estado em `localStorage` sob a chave `libris-auth`, o que faz a
   sessão sobreviver a um F5 — é a mesma técnica usada para o tema (`libris-theme`) e a estante
   (`libris-shelf`).
3. **Guarda de rotas** (`app/router/auth-guard.ts`): `requireAuth()` roda no `beforeLoad` das
   rotas autenticadas (`/search`, `/shelf`, `/book/$bookId`, agrupadas sob a rota `_authenticated`)
   e lança `redirect({ to: '/login' })` quando não há token. `redirectIfAuthenticated()` faz o
   caminho inverso na rota `/login`, evitando que um usuário já logado veja o formulário de novo.
4. **Logout** apenas limpa `authStore` (`user`/`token` voltam a `null`). Ele **não** apaga
   `shelfStore` — a estante é dado do usuário (local, não da sessão), e essa decisão de produto é
   validada explicitamente por um teste de integração
   (`src/test/integration/logout-clears-session.test.tsx`).

Não há verificação real de identidade em nenhum ponto: isso é apropriado para o escopo do
desafio, mas o mesmo padrão (token fake gerado no cliente, sem validação de servidor) não deveria
ir para produção.

## Desafios com a API do Google Books

A Google Books API é pública, sem autenticação obrigatória, mas isso trouxe alguns problemas
concretos que apareceram durante a implementação (os casos abaixo vêm direto de
`book-mapper.test.ts`, que os testa um a um):

- **Campos quase todos opcionais.** `volumeInfo.authors`, `volumeInfo.imageLinks`,
  `volumeInfo.description`, `volumeInfo.publisher` e `volumeInfo.publishedDate` podem estar
  ausentes em qualquer combinação — um livro pode não ter nenhum autor listado, ou ter autor mas
  não ter sinopse. O `book-mapper.ts` (`toBook`) normaliza tudo isso num único lugar: autores
  ausentes viram `[]` (nunca `undefined`), o restante vira `undefined` explícito, e cada tela sabe
  renderizar seu próprio fallback de texto ("Autor desconhecido", "Sinopse não disponível...").
- **Ausência de capa.** Quando não há `imageLinks`, ou quando só existe `smallThumbnail` (sem
  `thumbnail`), o mapper resolve a cascata (`thumbnail ?? smallThumbnail ?? null`) e retorna
  explicitamente `null` — nunca uma string vazia, que faria um `<img src="">` quebrado escapar
  para a UI. `BookCover` (`shared/ui/book-cover.tsx`) trata esse `null` caindo num placeholder
  ilustrado, e trata também a falha de carregamento de uma URL que a API devolveu mas que 404 na
  prática (`onError` troca para o mesmo placeholder).
- **`printType=all` não é um valor aceito pela própria API** — é um valor de conveniência da UI
  para "sem filtro", mas se enviado literalmente na query string a API rejeita. `buildSearchUrl`
  (`shared/api/google-books.ts`) só inclui o parâmetro `printType` quando o valor é `books` ou
  `magazines`; o mesmo raciocínio vale para `orderBy`, que só é enviado quando difere do default
  (`relevance`).
- **`previewLink` vem em `http://`**, o que o navegador trata como conteúdo misto ao abrir a
  partir de um site servido em `https://`. O mapper normaliza reescrevendo o prefixo para
  `https://` antes de expor o campo.
- **Rate limit sem API key.** Sem `VITE_GOOGLE_BOOKS_API_KEY`, a API aplica um limite de
  requisições bem mais agressivo (confirmado manualmente durante o desenvolvimento — a mesma
  IP tomou `429` repetidas vezes em sessões de teste manual). Três mitigações: debounce de 400ms
  no campo de busca (`useDebouncedValue`), cache do TanStack Query por `queryKey` (evita refetch
  ao voltar de uma tela de detalhe para a busca), e `shouldRetryOnServerError`
  (`shared/api/http-client.ts`) que **não** tenta de novo em erros 4xx — insistir num 429 só
  pioraria o próprio rate limit.
- **`GoogleVolume`/`GoogleSearchResponse` são validados por Zod** (`google-books.schema.ts`)
  antes mesmo de chegar ao mapper. Isso significa que um payload com um tipo inesperado (por
  exemplo `pageCount` vindo como string) falha de forma explícita e cedo, em vez de propagar um
  `undefined`/`NaN` silencioso pela UI.

## Decisões e trade-offs

- **Paginação por botões, não infinite scroll.** A API do Google Books não é otimizada para
  scroll contínuo (não há cursor, só `startIndex`), e botões "Anterior"/"Próxima" com
  `placeholderData: keepPreviousData` do TanStack Query já resolvem o requisito sem o custo de
  implementar/testar scroll infinito.
- **Filtros de busca vivem na URL** (`search params` da rota `/search`, validados por
  `searchFiltersSchema`), não em `useState` local. Isso permite navegar até o detalhe de um livro
  e voltar sem perder o que foi buscado, e torna a URL compartilhável/copiável.
- **Testes que intencionalmente não foram escritos**, para manter o esforço proporcional ao que
  o case pede:
  - Snapshots amplos de UI (baixo valor, alto custo de manutenção conforme a UI evolui).
  - E2E com Playwright/Cypress — fora do escopo pedido (Vitest + React Testing Library é o
    exigido).
  - Cobertura de 100% em componentes puramente visuais sem lógica condicional (ex.: `Badge`,
    `Skeleton`).
  - Testes de contraste de cor e responsividade real de viewport — Vitest/RTL não renderiza
    layout real de viewport; isso foi validado manualmente no Chrome (light/dark, 375–1280px+),
    documentado em `docs/exec/07-ui-polish.md`.
  - Um punhado de branches defensivos estruturalmente inatingíveis com a UI atual (ex.: o guard
    `if (!book) return` em `book-details-page.tsx`, só chamado depois que a tela já garantiu que
    `book` existe; ou o branch `header.isPlaceholder` do `shelf-table.tsx`, que só ocorre com
    cabeçalhos agrupados — esta tabela não agrupa colunas). Ficaram documentados no relatório de
    cobertura em vez de forçar um teste artificial só para inflar o número.
- **Nada ficou de fora do Core** pedido pelo case; o checklist completo de rastreabilidade está
  em `docs/libris-execution-plan.md#6-checklist-de-requisitos`.
