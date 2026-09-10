import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { searchFiltersSchema } from '@features/book-search/model/search-filters';
import { useShelfStore } from '@features/shelf/model/shelf-store';
import type { Book } from '@entities/book/model/types';

const useBookSearchMock = vi.fn();
const toastErrorMock = vi.fn();
const refetchMock = vi.fn();

vi.mock('@features/book-search/model/use-book-search', () => ({
  useBookSearch: () => useBookSearchMock(),
}));

vi.mock('sonner', () => ({
  toast: { error: (...args: unknown[]) => toastErrorMock(...args), success: vi.fn() },
}));

import { SearchPage } from './search-page';

// Router real (em memória) em vez de mockar `@tanstack/react-router`: os filtros de busca
// agora vivem nos search params da rota, então o teste precisa exercitar `useSearch`/`useNavigate`
// de verdade para validar que a URL reflete e sobrevive à digitação/paginação.
async function renderSearchPage(initialSearch = '') {
  const rootRoute = createRootRoute({ component: Outlet });
  const searchRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/search',
    validateSearch: searchFiltersSchema,
    component: SearchPage,
  });
  // Rota "irmã" vazia: o BookCard navega para /book/$bookId, então o router
  // de teste precisa conhecer essa rota para resolver o `Link` sem lançar.
  const bookDetailsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/book/$bookId',
    component: () => null,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([searchRoute, bookDetailsRoute]),
    history: createMemoryHistory({ initialEntries: [`/search${initialSearch}`] }),
  });
  await router.load();
  return { router, ...render(<RouterProvider router={router} />) };
}

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

describe('SearchPage', () => {
  beforeEach(() => {
    useBookSearchMock.mockReset();
    toastErrorMock.mockClear();
    refetchMock.mockClear();
    useShelfStore.setState({ items: [] });
  });

  it('shows the idle empty state before any query is typed', async () => {
    useBookSearchMock.mockReturnValue({ isLoading: false, isError: false, data: undefined, refetch: refetchMock });
    await renderSearchPage();
    expect(screen.getByText('Digite algo para começar a explorar')).toBeInTheDocument();
  });

  it('reads the initial query from the URL search params', async () => {
    useBookSearchMock.mockReturnValue({ isLoading: true, isError: false, data: undefined, refetch: refetchMock });
    await renderSearchPage('?query=dune');

    expect(screen.getByLabelText('Buscar livros')).toHaveValue('dune');
    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
  });

  it('shows a skeleton grid while loading, and typing updates the URL query', async () => {
    useBookSearchMock.mockReturnValue({ isLoading: true, isError: false, data: undefined, refetch: refetchMock });
    await renderSearchPage();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Buscar livros'), 'dune');

    expect(await screen.findByDisplayValue('dune')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
  });

  it('shows the "no results" empty state when totalItems is 0', async () => {
    useBookSearchMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { books: [], totalItems: 0 },
      refetch: refetchMock,
    });
    await renderSearchPage('?query=termoinexistente');

    expect(await screen.findByText(/Nenhum resultado para/)).toBeInTheDocument();
  });

  it('shows the error state with a retry button that calls refetch', async () => {
    useBookSearchMock.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch: refetchMock,
    });
    await renderSearchPage('?query=dune');

    const retryButton = await screen.findByRole('button', { name: 'Tentar novamente' });
    fireEvent.click(retryButton);

    expect(refetchMock).toHaveBeenCalled();
  });

  it('shows the error toast only once for a sustained error state', async () => {
    useBookSearchMock.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch: refetchMock,
    });
    const { router, rerender } = await renderSearchPage('?query=dune');
    rerender(<RouterProvider router={router} />);
    rerender(<RouterProvider router={router} />);

    expect(toastErrorMock).toHaveBeenCalledTimes(1);
  });

  it('renders a card per book when the search succeeds', async () => {
    useBookSearchMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { books: [makeBook({ id: 'book-1', title: 'Duna' }), makeBook({ id: 'book-2', title: 'Fundação' })], totalItems: 2 },
      refetch: refetchMock,
    });
    await renderSearchPage('?query=ficcao');

    expect(await screen.findByText('Duna')).toBeInTheDocument();
    expect(screen.getByText('Fundação')).toBeInTheDocument();
  });

  it('navigates to the next page and disables "Anterior" on the first page', async () => {
    useBookSearchMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { books: [makeBook()], totalItems: 40 },
      refetch: refetchMock,
    });
    const { router } = await renderSearchPage('?query=ficcao&page=1');

    expect(await screen.findByText('Página 1 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));

    expect(router.state.location.search).toMatchObject({ page: 2 });
  });

  it('navigates to the previous page when "Anterior" is clicked past page 1', async () => {
    useBookSearchMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { books: [makeBook()], totalItems: 40 },
      refetch: refetchMock,
    });
    const { router } = await renderSearchPage('?query=ficcao&page=2');

    expect(await screen.findByText('Página 2 de 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));

    expect(router.state.location.search).toMatchObject({ page: 1 });
  });
});
