import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { rootRoute } from '@app/router/routes/root';
import { indexRoute } from '@app/router/routes/index';
import { loginRoute } from '@app/router/routes/login';
import { authenticatedRoute } from '@app/router/routes/authenticated';
import { searchRoute } from '@app/router/routes/search';
import { shelfRoute } from '@app/router/routes/shelf';
import { bookDetailsRoute } from '@app/router/routes/book-details';

/**
 * Monta a mesma árvore de rotas do app real (router.tsx) sobre um histórico em memória,
 * para testes de integração que precisam navegar entre páginas de verdade (guards incluídos).
 */
export function createTestRouter(initialEntries: string[]) {
  const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    authenticatedRoute.addChildren([searchRoute, shelfRoute, bookDetailsRoute]),
  ]);

  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
  });
}
