import { describe, expect, it } from 'vitest';
import { searchResponseSchema, volumeSchema } from './google-books.schema';

describe('volumeSchema', () => {
  it('parses a minimal payload (only id and title) without throwing', () => {
    expect(() => volumeSchema.parse({ id: 'abc123', volumeInfo: { title: 'Foo' } })).not.toThrow();
  });

  it('rejects a payload with a wrong-typed field', () => {
    const result = volumeSchema.safeParse({
      id: 'abc123',
      volumeInfo: { title: 'Foo', pageCount: '10' },
    });
    expect(result.success).toBe(false);
  });
});

describe('searchResponseSchema', () => {
  it('parses totalItems: 0 without items', () => {
    expect(() => searchResponseSchema.parse({ totalItems: 0 })).not.toThrow();
  });
});
