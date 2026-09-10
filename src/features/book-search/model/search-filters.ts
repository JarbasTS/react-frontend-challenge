import { z } from 'zod';
import type { SearchOrderBy, SearchPrintType } from '@shared/api/google-books';

export const PAGE_SIZE = 20;

export interface SearchFilters {
  query: string;
  printType: SearchPrintType;
  orderBy: SearchOrderBy;
  page: number;
}

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  query: '',
  printType: 'all',
  orderBy: 'relevance',
  page: 1,
};

/**
 * Validação dos search params da rota `/search`. Cada campo é `optional().default()` para
 * que um `<Link to="/search">` sem `search` explícito continue válido no nível de tipos, e
 * `.catch()` volta ao default em vez de lançar para uma URL editada manualmente com lixo —
 * os filtros vivem na URL para sobreviver à navegação até o detalhe do livro e de volta.
 */
export const searchFiltersSchema = z.object({
  query: z.string().optional().default(DEFAULT_SEARCH_FILTERS.query).catch(DEFAULT_SEARCH_FILTERS.query),
  printType: z
    .enum(['all', 'books', 'magazines'])
    .optional()
    .default(DEFAULT_SEARCH_FILTERS.printType)
    .catch(DEFAULT_SEARCH_FILTERS.printType),
  orderBy: z
    .enum(['relevance', 'newest'])
    .optional()
    .default(DEFAULT_SEARCH_FILTERS.orderBy)
    .catch(DEFAULT_SEARCH_FILTERS.orderBy),
  page: z.number().int().min(1).optional().default(DEFAULT_SEARCH_FILTERS.page).catch(DEFAULT_SEARCH_FILTERS.page),
});

/**
 * Ao mudar `query`, `printType` ou `orderBy` a página volta para 1.
 * Uma mudança apenas de `page` preserva os demais filtros.
 */
export function resetPageOnFilterChange(
  prev: SearchFilters,
  next: Partial<SearchFilters>
): SearchFilters {
  const changesOnlyPage =
    Object.keys(next).length > 0 && Object.keys(next).every((key) => key === 'page');

  if (changesOnlyPage) {
    return { ...prev, ...next };
  }

  return { ...prev, ...next, page: 1 };
}
