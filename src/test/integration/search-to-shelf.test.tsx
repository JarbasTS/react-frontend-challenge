import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { createTestQueryClient } from '@test/render-with-providers';
import { createTestRouter } from '@test/test-router';
import { useAuthStore } from '@features/auth/model/auth-store';
import { useShelfStore } from '@features/shelf/model/shelf-store';
import type { GoogleSearchResponse } from '@shared/api/google-books.schema';
import { mockCompleteVolume, mockIncompleteVolume, mockSearchResponse } from '@test/mock-google-books';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() }, Toaster: () => null }));

const searchVolumesMock = vi.fn<() => Promise<GoogleSearchResponse>>();

vi.mock('@shared/api/google-books', () => ({
  searchVolumes: (...args: unknown[]) => searchVolumesMock(...(args as [])),
}));

async function renderApp(initialEntries: string[]) {
  const router = createTestRouter(initialEntries);
  await router.load();
  const queryClient = createTestQueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return router;
}

describe('Integração: busca → estante', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: { email: 'leitor@libris.dev' }, token: 'fake-token' });
    useShelfStore.setState({ items: [] });
    searchVolumesMock.mockReset();
    // Mistura um volume completo com um "sujo" (sem capa/autores/sinopse) — cenário real da API —
    // para provar que o pipeline schema → mapper → BookCard não quebra e cai nos fallbacks certos.
    searchVolumesMock.mockResolvedValue(mockSearchResponse([mockCompleteVolume(), mockIncompleteVolume()]));
  });

  it('adicionar um livro pelo BookCard na busca faz ele aparecer na estante com status "Quero Ler"', async () => {
    await renderApp(['/search?query=duna']);

    expect(await screen.findByText('Duna')).toBeInTheDocument();
    expect(screen.getByText('Fundação')).toBeInTheDocument();
    expect(screen.getByText('Autor desconhecido')).toBeInTheDocument();

    const user = userEvent.setup();
    const [addDunaButton] = screen.getAllByRole('button', { name: 'Adicionar à estante' });
    await user.click(addDunaButton!);

    expect(useShelfStore.getState().isInShelf('book-1')).toBe(true);

    await user.click(screen.getByRole('link', { name: 'Estante' }));

    const row = (await screen.findByText('Duna')).closest('tr');
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getByText('Quero Ler')).toBeInTheDocument();
  });
});
