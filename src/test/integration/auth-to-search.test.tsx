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

describe('Integração: autenticação → busca', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
    useShelfStore.setState({ items: [] });
  });

  it('login bem-sucedido redireciona para /search e a busca fica acessível sem o guard bloquear', async () => {
    const router = await renderApp(['/login']);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('E-mail'), 'leitor@libris.dev');
    await user.type(screen.getByLabelText('Senha'), 'senha1234');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByLabelText('Buscar livros')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/search');
  });

  it('visitante não autenticado que tenta acessar /search é redirecionado para /login', async () => {
    const router = await renderApp(['/search']);

    expect(await screen.findByLabelText('E-mail')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('usuário já autenticado que acessa "/" é redirecionado direto para /search', async () => {
    useAuthStore.getState().login('leitor@libris.dev');

    const router = await renderApp(['/']);

    expect(await screen.findByLabelText('Buscar livros')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/search');
  });
});
