import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@shared/ui/sonner';
import { useThemeStore } from '@shared/lib/theme-store';

function RootComponent() {
  const theme = useThemeStore((state) => state.theme);

  return (
    <>
      <Outlet />
      <Toaster theme={theme} />
    </>
  );
}

export const rootRoute = createRootRoute({ component: RootComponent });
