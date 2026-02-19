import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        if ((error as { status?: number }).status === 401 || (error as { status?: number }).status === 403 || (error as { status?: number }).status === 404) {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: true,
    },
  },
});
