import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useShelfStore } from '@features/shelf/model/shelf-store';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: React.ComponentProps<'a'> & { to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { ShelfPage } from './shelf-page';

describe('ShelfPage', () => {
  beforeEach(() => {
    useShelfStore.setState({ items: [] });
  });

  it('renders the empty state with a CTA to /search when there are no items', () => {
    render(<ShelfPage />);

    expect(screen.getByText('Sua estante ainda não tem livros')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Buscar livros' })).toHaveAttribute('href', '/search');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders the ShelfTable and not the empty state when there is at least one item', () => {
    useShelfStore.getState().addBook({
      id: 'book-1',
      title: 'Duna',
      authors: ['Frank Herbert'],
      thumbnail: null,
      printType: 'BOOK',
      categories: [],
    });
    render(<ShelfPage />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Duna')).toBeInTheDocument();
    expect(screen.queryByText('Sua estante ainda não tem livros')).not.toBeInTheDocument();
  });
});
