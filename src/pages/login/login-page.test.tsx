import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@test/render-with-providers';
import { useAuthStore } from '@features/auth/model/auth-store';

const navigateMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { LoginPage } from './login-page';

describe('LoginPage', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    useAuthStore.setState({ user: null, token: null });
  });

  it('shows a validation error and does not log in when the email is invalid', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText('E-mail'), 'not-an-email');
    await user.type(screen.getByLabelText('Senha'), '1234567');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe um e-mail válido')).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('shows a validation error when the password is too short', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText('E-mail'), 'a@a.com');
    await user.type(screen.getByLabelText('Senha'), '123456');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('A senha deve ter mais de 6 caracteres')).toBeInTheDocument();
  });

  it('logs in and navigates to /search with valid data', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText('E-mail'), 'a@a.com');
    await user.type(screen.getByLabelText('Senha'), '1234567');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBeTruthy();
    });
    expect(useAuthStore.getState().user).toEqual({ email: 'a@a.com' });
    expect(navigateMock).toHaveBeenCalledWith({ to: '/search' });
  });
});
