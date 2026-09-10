import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@features/auth/model/auth-store';
import { redirectIfAuthenticated, requireAuth } from './auth-guard';

describe('requireAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
  });

  it('throws (redirects) when there is no token', () => {
    expect(() => requireAuth()).toThrow();
  });

  it('does not throw when a token is present', () => {
    useAuthStore.setState({ token: 'fake-token', user: { email: 'a@a.com' } });
    expect(() => requireAuth()).not.toThrow();
  });
});

describe('redirectIfAuthenticated', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
  });

  it('does not throw when there is no token', () => {
    expect(() => redirectIfAuthenticated()).not.toThrow();
  });

  it('throws (redirects) when a token is present', () => {
    useAuthStore.setState({ token: 'fake-token', user: { email: 'a@a.com' } });
    expect(() => redirectIfAuthenticated()).toThrow();
  });
});
