import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { shouldRetryOnServerError } from '@shared/api/http-client';
import { searchVolumes } from '@shared/api/google-books';
import { toBookSearchResult } from '@entities/book/model/search-result';
import { useDebouncedValue } from '@shared/lib/use-debounced-value';
import { PAGE_SIZE, type SearchFilters } from './search-filters';

export function useBookSearch(filters: SearchFilters) {
  const debouncedQuery = useDebouncedValue(filters.query, 400);
  const trimmedQuery = debouncedQuery.trim();

  return useQuery({
    queryKey: [
      'books',
      'search',
      { query: trimmedQuery, printType: filters.printType, orderBy: filters.orderBy, page: filters.page },
    ],
    queryFn: () =>
      searchVolumes({
        q: trimmedQuery,
        startIndex: (filters.page - 1) * PAGE_SIZE,
        maxResults: PAGE_SIZE,
        printType: filters.printType,
        orderBy: filters.orderBy,
      }).then(toBookSearchResult),
    enabled: trimmedQuery.length > 0,
    placeholderData: keepPreviousData,
    retry: shouldRetryOnServerError,
  });
}
