import { createRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@features/auth/model/auth-store';
import { rootRoute } from './root';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: useAuthStore.getState().token ? '/search' : '/login' });
  },
});
