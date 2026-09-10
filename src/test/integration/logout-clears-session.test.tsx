import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { createTestQueryClient } from '@test/render-with-providers';
import { createTestRouter } from '@test/test-router';
import { useAuthStore } from '@features/auth/model/auth-store';
import { useShelfStore } from '@features/shelf/model/shelf-store';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() }, Toaster: () => null }));

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

describe('Integração: logout preserva a estante', () => {
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
  });

  it('logout limpa a sessão (authStore) mas não apaga a estante (shelfStore)', async () => {
    const router = await renderApp(['/shelf']);

    expect(await screen.findByText('Duna')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Sair' }));

    expect(await screen.findByLabelText('E-mail')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');

    const authState = useAuthStore.getState();
    expect(authState.user).toBeNull();
    expect(authState.token).toBeNull();

    // A estante é dado local do usuário, não da sessão — deve sobreviver ao logout.
    expect(useShelfStore.getState().items).toHaveLength(1);
    expect(useShelfStore.getState().items[0]?.title).toBe('Duna');
  });
});
