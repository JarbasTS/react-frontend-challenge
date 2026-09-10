import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createTestQueryClient } from '@test/render-with-providers';
import { QueryClientProvider } from '@tanstack/react-query';
import * as googleBooksApi from '@shared/api/google-books';
import { HttpError } from '@shared/api/http-client';
import { DEFAULT_SEARCH_FILTERS } from './search-filters';
import { useBookSearch } from './use-book-search';

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useBookSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('does not call searchVolumes when the query is empty', async () => {
    const spy = vi.spyOn(googleBooksApi, 'searchVolumes');

    renderHook(() => useBookSearch(DEFAULT_SEARCH_FILTERS), { wrapper });
    await vi.advanceTimersByTimeAsync(500);

    expect(spy).not.toHaveBeenCalled();
  });

  it('calls searchVolumes with the correct startIndex after the debounce settles', async () => {
    const spy = vi
      .spyOn(googleBooksApi, 'searchVolumes')
      .mockResolvedValue({ totalItems: 0 });

    const { result } = renderHook(
      () => useBookSearch({ ...DEFAULT_SEARCH_FILTERS, query: 'dune', page: 2 }),
      { wrapper }
    );

    await vi.advanceTimersByTimeAsync(500);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'dune', startIndex: 20, maxResults: 20 })
    );
  });

  it('does not retry a 4xx error (e.g. rate limit) — fails fast instead of hammering the API', async () => {
    const spy = vi
      .spyOn(googleBooksApi, 'searchVolumes')
      .mockRejectedValue(new HttpError(429, 'Too Many Requests'));

    const { result } = renderHook(
      () => useBookSearch({ ...DEFAULT_SEARCH_FILTERS, query: 'dune' }),
      { wrapper }
    );

    await vi.advanceTimersByTimeAsync(500);
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
