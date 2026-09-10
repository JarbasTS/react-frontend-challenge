import { describe, expect, it } from 'vitest';
import { toBookSearchResult } from './search-result';

describe('toBookSearchResult', () => {
  it('returns an empty books array when items is absent (totalItems: 0)', () => {
    const result = toBookSearchResult({ totalItems: 0 });
    expect(result).toEqual({ books: [], totalItems: 0 });
  });

  it('maps each item through toBook and preserves totalItems', () => {
    const result = toBookSearchResult({
      totalItems: 2,
      items: [
        { id: '1', volumeInfo: { title: 'Livro 1' } },
        { id: '2', volumeInfo: { title: 'Livro 2' } },
      ],
    });

    expect(result.totalItems).toBe(2);
    expect(result.books).toHaveLength(2);
    expect(result.books[0]).toMatchObject({ id: '1', title: 'Livro 1' });
    expect(result.books[1]).toMatchObject({ id: '2', title: 'Livro 2' });
  });
});
