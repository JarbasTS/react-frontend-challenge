import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '@test/render-with-providers';
import type { Book } from '@entities/book/model/types';
import { useShelfStore } from '@features/shelf/model/shelf-store';

const navigateMock = vi.fn();
const useBookDetailsMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
  useParams: () => ({ bookId: 'book-1' }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@entities/book/model/use-book-details', () => ({
  useBookDetails: (id: string) => useBookDetailsMock(id),
}));

import { BookDetailsPage } from './book-details-page';

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

describe('BookDetailsPage', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    useBookDetailsMock.mockReset();
    useShelfStore.setState({ items: [] });
  });

  it('shows a skeleton while loading, without the real content', () => {
    useBookDetailsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    renderWithProviders(<BookDetailsPage />);

    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
    expect(screen.queryByText('Duna')).not.toBeInTheDocument();
  });

  it('shows an error state with a back button that navigates to /search', () => {
    useBookDetailsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderWithProviders(<BookDetailsPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Voltar para a busca' }));

    expect(navigateMock).toHaveBeenCalledWith({ to: '/search' });
  });

  it('falls back to placeholder text for missing publisher, date and description', () => {
    useBookDetailsMock.mockReturnValue({
      data: makeBook({ publisher: undefined, publishedDate: undefined, description: undefined }),
      isLoading: false,
      isError: false,
    });
    renderWithProviders(<BookDetailsPage />);

    expect(screen.getByText('Editora não informada')).toBeInTheDocument();
    expect(screen.getByText('Data não informada')).toBeInTheDocument();
    expect(screen.getByText('Sinopse não disponível para este título.')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });

  it('does not render the preview link when previewLink is absent', () => {
    useBookDetailsMock.mockReturnValue({
      data: makeBook({ previewLink: undefined }),
      isLoading: false,
      isError: false,
    });
    renderWithProviders(<BookDetailsPage />);

    expect(screen.queryByRole('link', { name: 'Ver preview' })).not.toBeInTheDocument();
  });

  it('renders the preview link with target=_blank and rel=noreferrer when present', () => {
    useBookDetailsMock.mockReturnValue({
      data: makeBook({ previewLink: 'https://books.example/preview' }),
      isLoading: false,
      isError: false,
    });
    renderWithProviders(<BookDetailsPage />);

    const link = screen.getByRole('link', { name: 'Ver preview' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('renders a badge for each category', () => {
    useBookDetailsMock.mockReturnValue({
      data: makeBook({ categories: ['Ficção Científica', 'Clássicos'] }),
      isLoading: false,
      isError: false,
    });
    renderWithProviders(<BookDetailsPage />);

    expect(screen.getByText('Ficção Científica')).toBeInTheDocument();
    expect(screen.getByText('Clássicos')).toBeInTheDocument();
  });

  it('shows "Adicionar à estante" when not in shelf and adds it on click', () => {
    const book = makeBook();
    useBookDetailsMock.mockReturnValue({ data: book, isLoading: false, isError: false });
    renderWithProviders(<BookDetailsPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar à estante' }));

    expect(useShelfStore.getState().isInShelf('book-1')).toBe(true);
    expect(screen.getByRole('button', { name: 'Remover da estante' })).toBeInTheDocument();
  });

  it('shows "Remover da estante" when already in shelf and removes it on click', () => {
    const book = makeBook();
    useShelfStore.getState().addBook(book);
    useBookDetailsMock.mockReturnValue({ data: book, isLoading: false, isError: false });
    renderWithProviders(<BookDetailsPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Remover da estante' }));

    expect(useShelfStore.getState().isInShelf('book-1')).toBe(false);
    expect(screen.getByRole('button', { name: 'Adicionar à estante' })).toBeInTheDocument();
  });
});
