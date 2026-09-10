import { createRoute } from '@tanstack/react-router';
import { requireAuth } from '@app/router/auth-guard';
import { AppLayout } from '@app/layout/app-layout';
import { rootRoute } from './root';

export const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_authenticated',
  beforeLoad: requireAuth,
  component: AppLayout,
});
