import { createRouter } from '@tanstack/react-router';
import { rootRoute } from './routes/root';
import { indexRoute } from './routes/index';
import { loginRoute } from './routes/login';
import { authenticatedRoute } from './routes/authenticated';
import { searchRoute } from './routes/search';
import { shelfRoute } from './routes/shelf';
import { bookDetailsRoute } from './routes/book-details';

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  authenticatedRoute.addChildren([searchRoute, shelfRoute, bookDetailsRoute]),
]);

export const router = createRouter({ routeTree, defaultPreload: 'intent' });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
