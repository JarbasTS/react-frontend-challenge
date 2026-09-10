import { createRoute } from '@tanstack/react-router';
import { SearchPage } from '@pages/search/search-page';
import { searchFiltersSchema } from '@features/book-search/model/search-filters';
import { authenticatedRoute } from './authenticated';

export const searchRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/search',
  validateSearch: searchFiltersSchema,
  component: SearchPage,
});
