import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from './auth-store';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
  });

  it('login sets user.email and a truthy token', () => {
    useAuthStore.getState().login('a@a.com');

    const state = useAuthStore.getState();
    expect(state.user).toEqual({ email: 'a@a.com' });
    expect(typeof state.token).toBe('string');
    expect(state.token).toBeTruthy();
  });

  it('logout clears user and token back to null', () => {
    useAuthStore.getState().login('a@a.com');
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('persists the token to localStorage under "libris-auth"', () => {
    useAuthStore.getState().login('a@a.com');

    const stored = localStorage.getItem('libris-auth');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored as string).state.token).toBeTruthy();
  });
});
