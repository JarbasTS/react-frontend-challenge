import type { GoogleSearchResponse } from '@shared/api/google-books.schema';
import { toBook } from '../lib/book-mapper';
import type { Book } from './types';

export interface BookSearchResult {
  books: Book[];
  totalItems: number;
}

export function toBookSearchResult(response: GoogleSearchResponse): BookSearchResult {
  return {
    books: (response.items ?? []).map(toBook),
    totalItems: response.totalItems,
  };
}
