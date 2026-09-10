import { redirect } from '@tanstack/react-router';
import { useAuthStore } from '@features/auth/model/auth-store';

/** Usado no `beforeLoad` das rotas protegidas. Lança um redirect para /login quando não há sessão. */
export function requireAuth() {
  if (!useAuthStore.getState().token) {
    throw redirect({ to: '/login' });
  }
}

/** Usado no `beforeLoad` de /login. Lança um redirect para /search quando já há sessão. */
export function redirectIfAuthenticated() {
  if (useAuthStore.getState().token) {
    throw redirect({ to: '/search' });
  }
}
