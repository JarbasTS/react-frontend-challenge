import { createRoute } from '@tanstack/react-router';
import { ShelfPage } from '@pages/shelf/shelf-page';
import { authenticatedRoute } from './authenticated';

export const shelfRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/shelf',
  component: ShelfPage,
});
