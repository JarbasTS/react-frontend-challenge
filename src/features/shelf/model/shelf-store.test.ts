import { beforeEach, describe, expect, it } from 'vitest';
import type { Book } from '@entities/book/model/types';
import { useShelfStore } from './shelf-store';

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'book-1',
    title: 'Duna',
    authors: ['Frank Herbert'],
    thumbnail: null,
    printType: 'BOOK',
    categories: [],
    ...overrides,
  };
}

describe('useShelfStore', () => {
  beforeEach(() => {
    useShelfStore.setState({ items: [] });
  });

  it('addBook adds an item with status "want-to-read" and a defined addedAt', () => {
    useShelfStore.getState().addBook(makeBook());

    const [item] = useShelfStore.getState().items;
    expect(item?.status).toBe('want-to-read');
    expect(item?.addedAt).toBeTruthy();
    expect(() => new Date(item!.addedAt).toISOString()).not.toThrow();
  });

  it('addBook is a no-op when the id already exists (no duplicates)', () => {
    useShelfStore.getState().addBook(makeBook());
    useShelfStore.getState().addBook(makeBook({ title: 'Duna (outra edição)' }));

    const { items } = useShelfStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe('Duna');
  });

  it('removeBook removes only the matching item', () => {
    useShelfStore.getState().addBook(makeBook({ id: 'book-1' }));
    useShelfStore.getState().addBook(makeBook({ id: 'book-2' }));

    useShelfStore.getState().removeBook('book-1');

    const { items } = useShelfStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe('book-2');
  });

  it('updateStatus changes only the targeted item, leaving the others intact', () => {
    useShelfStore.getState().addBook(makeBook({ id: 'book-1' }));
    useShelfStore.getState().addBook(makeBook({ id: 'book-2' }));

    useShelfStore.getState().updateStatus('book-1', 'reading');

    const { items } = useShelfStore.getState();
    expect(items.find((i) => i.id === 'book-1')?.status).toBe('reading');
    expect(items.find((i) => i.id === 'book-2')?.status).toBe('want-to-read');
  });

  it('isInShelf reflects addBook/removeBook', () => {
    expect(useShelfStore.getState().isInShelf('book-1')).toBe(false);

    useShelfStore.getState().addBook(makeBook({ id: 'book-1' }));
    expect(useShelfStore.getState().isInShelf('book-1')).toBe(true);

    useShelfStore.getState().removeBook('book-1');
    expect(useShelfStore.getState().isInShelf('book-1')).toBe(false);
  });

  it('persists items to localStorage under "libris-shelf"', () => {
    useShelfStore.getState().addBook(makeBook());

    const stored = localStorage.getItem('libris-shelf');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored as string).state.items).toHaveLength(1);
  });
});
