import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      // Evita que o React Query "pause" retries indefinidamente quando o
      // onlineManager interno julga (às vezes incorretamente) o navegador
      // offline — sem isso, loading/error nunca resolvem e a UI trava.
      networkMode: 'always',
    },
  },
});
