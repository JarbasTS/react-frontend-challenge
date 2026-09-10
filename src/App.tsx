import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from '@app/providers/query-client';
import { ThemeProvider } from '@app/providers/theme-provider';
import { router } from '@app/router/router';
import { useThemeStore } from '@shared/lib/theme-store';
import { Toaster } from '@shared/ui/sonner';

export function App() {
  const theme = useThemeStore((state) => state.theme);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster theme={theme} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
