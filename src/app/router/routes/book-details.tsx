import { createRoute } from '@tanstack/react-router';
import { BookDetailsPage } from '@pages/book-details/book-details-page';
import { authenticatedRoute } from './authenticated';

export const bookDetailsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/book/$bookId',
  component: BookDetailsPage,
});
