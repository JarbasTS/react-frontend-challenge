import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useAuthStore } from '@features/auth/model/auth-store';
import { useThemeStore } from '@shared/lib/theme-store';

const navigateMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: React.ComponentProps<'a'> & { to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  Outlet: () => <div data-testid="outlet" />,
  useNavigate: () => navigateMock,
}));

import { AppLayout } from './app-layout';

describe('AppLayout', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    useAuthStore.setState({ user: null, token: null });
    useThemeStore.setState({ theme: 'light' });
  });

  it("shows the user's email in the header when authenticated", () => {
    useAuthStore.setState({ user: { email: 'leitor@libris.dev' }, token: 'token-123' });
    render(<AppLayout />);

    expect(screen.getByText('leitor@libris.dev')).toBeInTheDocument();
  });

  it('clicking "Sair" logs out and navigates to /login', () => {
    useAuthStore.setState({ user: { email: 'leitor@libris.dev' }, token: 'token-123' });
    render(<AppLayout />);

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));

    expect(useAuthStore.getState().token).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith({ to: '/login' });
  });

  it('clicking the theme toggle calls themeStore.toggleTheme()', () => {
    render(<AppLayout />);

    fireEvent.click(screen.getByRole('button', { name: /alternar tema/i }));

    expect(useThemeStore.getState().theme).toBe('dark');
  });
});
