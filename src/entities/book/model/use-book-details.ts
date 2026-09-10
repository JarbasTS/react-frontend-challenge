import { useQuery } from '@tanstack/react-query';
import { shouldRetryOnServerError } from '@shared/api/http-client';
import { getVolume } from '@shared/api/google-books';
import { toBook } from '../lib/book-mapper';

export function useBookDetails(bookId: string) {
  return useQuery({
    queryKey: ['books', 'detail', bookId],
    queryFn: () => getVolume(bookId).then(toBook),
    staleTime: 5 * 60_000,
    retry: shouldRetryOnServerError,
  });
}
