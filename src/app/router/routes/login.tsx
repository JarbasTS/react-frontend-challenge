import { createRoute } from '@tanstack/react-router';
import { redirectIfAuthenticated } from '@app/router/auth-guard';
import { LoginPage } from '@pages/login/login-page';
import { rootRoute } from './root';

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: redirectIfAuthenticated,
  component: LoginPage,
});
