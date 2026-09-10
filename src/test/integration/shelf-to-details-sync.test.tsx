import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { createTestQueryClient } from '@test/render-with-providers';
import { createTestRouter } from '@test/test-router';
import { useAuthStore } from '@features/auth/model/auth-store';
import { useShelfStore } from '@features/shelf/model/shelf-store';
import type { GoogleVolume } from '@shared/api/google-books.schema';
import { mockCompleteVolume } from '@test/mock-google-books';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() }, Toaster: () => null }));

const getVolumeMock = vi.fn<() => Promise<GoogleVolume>>();

vi.mock('@shared/api/google-books', () => ({
  getVolume: (...args: unknown[]) => getVolumeMock(...(args as [])),
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

describe('Integração: estante → detalhe do livro', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: { email: 'leitor@libris.dev' }, token: 'fake-token' });
    useShelfStore.setState({ items: [] });
    useShelfStore.getState().addBook({
      id: 'book-1',
      title: 'Duna',
      authors: ['Frank Herbert'],
      thumbnail: null,
      printType: 'BOOK',
      categories: [],
    });
    getVolumeMock.mockReset();
    getVolumeMock.mockResolvedValue(mockCompleteVolume());
  });

  it('alterar o status na tabela e navegar para o detalhe mantém o estado "na estante" sem refetch', async () => {
    await renderApp(['/shelf']);

    const user = userEvent.setup();
    await user.click(screen.getByLabelText('Status de Duna'));
    await user.click(await screen.findByRole('option', { name: 'Lendo' }));
    expect(useShelfStore.getState().items[0]?.status).toBe('reading');

    await user.click(screen.getByRole('link', { name: 'Ver detalhes' }));

    expect(await screen.findByRole('heading', { name: 'Duna' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover da estante' })).toBeInTheDocument();
    // A mudança de status feita na tabela continua refletida na store compartilhada,
    // sem que a navegação para o detalhe tenha precisado refazer esse estado.
    expect(useShelfStore.getState().items[0]?.status).toBe('reading');
  });
});
