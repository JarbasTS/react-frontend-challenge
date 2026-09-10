import { describe, expect, it } from 'vitest';
import { DEFAULT_SEARCH_FILTERS, resetPageOnFilterChange, searchFiltersSchema } from './search-filters';

describe('resetPageOnFilterChange', () => {
  it('resets page to 1 when printType changes', () => {
    const prev = { ...DEFAULT_SEARCH_FILTERS, page: 3 };
    const result = resetPageOnFilterChange(prev, { printType: 'books' });
    expect(result.page).toBe(1);
    expect(result.printType).toBe('books');
  });

  it('resets page to 1 when orderBy changes', () => {
    const prev = { ...DEFAULT_SEARCH_FILTERS, page: 3 };
    const result = resetPageOnFilterChange(prev, { orderBy: 'newest' });
    expect(result.page).toBe(1);
  });

  it('resets page to 1 when the query changes', () => {
    const prev = { ...DEFAULT_SEARCH_FILTERS, page: 3 };
    const result = resetPageOnFilterChange(prev, { query: 'dune' });
    expect(result.page).toBe(1);
  });

  it('preserves the requested page when only page changes', () => {
    const prev = { ...DEFAULT_SEARCH_FILTERS, query: 'dune', page: 1 };
    const result = resetPageOnFilterChange(prev, { page: 2 });
    expect(result.page).toBe(2);
    expect(result.query).toBe('dune');
  });
});

describe('searchFiltersSchema', () => {
  it('parses a valid search object as-is', () => {
    const result = searchFiltersSchema.parse({ query: 'dune', printType: 'books', orderBy: 'newest', page: 2 });
    expect(result).toEqual({ query: 'dune', printType: 'books', orderBy: 'newest', page: 2 });
  });

  it('falls back to the defaults for missing or invalid fields instead of throwing', () => {
    const result = searchFiltersSchema.parse({ printType: 'not-a-real-type', page: -1 });
    expect(result).toEqual(DEFAULT_SEARCH_FILTERS);
  });
});
