import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ShelfBook } from '@entities/shelf/model/types';
import { useShelfStore } from '@features/shelf/model/shelf-store';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a>,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { ShelfTable } from './shelf-table';

function makeItem(overrides: Partial<ShelfBook> = {}): ShelfBook {
  return {
    id: 'book-1',
    title: 'Duna',
    authors: ['Frank Herbert'],
    thumbnail: null,
    printType: 'BOOK',
    categories: [],
    status: 'want-to-read',
    addedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('ShelfTable', () => {
  beforeEach(() => {
    useShelfStore.setState({ items: [] });
  });

  it('renders one row per item with the correct title, author and date', () => {
    const items = [
      makeItem({ id: 'book-1', title: 'Duna', authors: ['Frank Herbert'], publishedDate: '1965' }),
      makeItem({ id: 'book-2', title: 'Fundação', authors: [], publishedDate: undefined }),
    ];
    render(<ShelfTable items={items} />);

    const rows = screen.getAllByRole('row').slice(1); // exclude header row
    expect(rows).toHaveLength(2);
    expect(within(rows[0]!).getByText('Duna')).toBeInTheDocument();
    expect(within(rows[0]!).getByText('Frank Herbert')).toBeInTheDocument();
    expect(within(rows[0]!).getByText('1965')).toBeInTheDocument();
    expect(within(rows[1]!).getByText('Fundação')).toBeInTheDocument();
    expect(within(rows[1]!).getByText('Autor desconhecido')).toBeInTheDocument();
    expect(within(rows[1]!).getByText('—')).toBeInTheDocument();
  });

  it('sorts rows alphabetically by title when the header is clicked, and reverses on a second click', () => {
    const items = [makeItem({ id: 'book-1', title: 'Zorba' }), makeItem({ id: 'book-2', title: 'Alice' })];
    render(<ShelfTable items={items} />);

    const titleHeader = screen.getByRole('button', { name: 'Título' });
    fireEvent.click(titleHeader);

    let rows = screen.getAllByRole('row').slice(1);
    expect(within(rows[0]!).getByText('Alice')).toBeInTheDocument();
    expect(within(rows[1]!).getByText('Zorba')).toBeInTheDocument();
    expect(titleHeader.querySelector('svg')).toBeInTheDocument();

    fireEvent.click(titleHeader);

    rows = screen.getAllByRole('row').slice(1);
    expect(within(rows[0]!).getByText('Zorba')).toBeInTheDocument();
    expect(within(rows[1]!).getByText('Alice')).toBeInTheDocument();
    expect(titleHeader.querySelector('svg')).toBeInTheDocument();
  });

  it('changing the status select calls updateStatus with the new value', async () => {
    const user = userEvent.setup();
    useShelfStore.getState().addBook({
      id: 'book-1',
      title: 'Duna',
      authors: ['Frank Herbert'],
      thumbnail: null,
      printType: 'BOOK',
      categories: [],
    });
    render(<ShelfTable items={useShelfStore.getState().items} />);

    await user.click(screen.getByLabelText('Status de Duna'));
    await user.click(await screen.findByRole('option', { name: 'Lendo' }));

    expect(useShelfStore.getState().items[0]?.status).toBe('reading');
  });

  it('clicking "Remover" calls removeBook for that row', () => {
    useShelfStore.getState().addBook({
      id: 'book-1',
      title: 'Duna',
      authors: ['Frank Herbert'],
      thumbnail: null,
      printType: 'BOOK',
      categories: [],
    });
    const items = useShelfStore.getState().items;
    render(<ShelfTable items={items} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remover' }));

    expect(useShelfStore.getState().isInShelf('book-1')).toBe(false);
  });
});
