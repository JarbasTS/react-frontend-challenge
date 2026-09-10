import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { Book } from '@entities/book/model/types';
import { useShelfStore } from '@features/shelf/model/shelf-store';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a>,
}));

import { BookCard } from './book-card';

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'book-1',
    title: 'Duna',
    authors: [],
    thumbnail: null,
    printType: 'BOOK',
    categories: [],
    ...overrides,
  };
}

describe('BookCard', () => {
  beforeEach(() => {
    useShelfStore.setState({ items: [] });
  });

  it('shows "Autor desconhecido" when authors is empty', () => {
    render(<BookCard book={makeBook({ authors: [] })} />);
    expect(screen.getByText('Autor desconhecido')).toBeInTheDocument();
  });

  it('joins multiple authors with a comma', () => {
    render(<BookCard book={makeBook({ authors: ['Frank Herbert', 'Brian Herbert'] })} />);
    expect(screen.getByText('Frank Herbert, Brian Herbert')).toBeInTheDocument();
  });

  it('clicking "Adicionar à estante" adds the book to the shelf', () => {
    render(<BookCard book={makeBook()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar à estante' }));

    expect(useShelfStore.getState().isInShelf('book-1')).toBe(true);
  });

  it('shows "Remover da estante" and removes the book when already in the shelf', () => {
    useShelfStore.getState().addBook(makeBook());
    render(<BookCard book={makeBook()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remover da estante' }));

    expect(useShelfStore.getState().isInShelf('book-1')).toBe(false);
  });
});
