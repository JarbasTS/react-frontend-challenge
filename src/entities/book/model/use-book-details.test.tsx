import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@test/render-with-providers';
import * as googleBooksApi from '@shared/api/google-books';
import type { GoogleVolume } from '@shared/api/google-books.schema';
import { HttpError } from '@shared/api/http-client';
import { useBookDetails } from './use-book-details';

function makeVolume(overrides: Partial<GoogleVolume['volumeInfo']> = {}): GoogleVolume {
  return {
    id: 'book-1',
    volumeInfo: {
      title: 'Duna',
      authors: ['Frank Herbert'],
      ...overrides,
    },
  };
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useBookDetails', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a mapped Book on success', async () => {
    vi.spyOn(googleBooksApi, 'getVolume').mockResolvedValue(makeVolume());

    const { result } = renderHook(() => useBookDetails('book-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({ id: 'book-1', title: 'Duna', authors: ['Frank Herbert'] });
  });

  it('keeps data undefined when getVolume rejects (e.g. 404)', async () => {
    vi.spyOn(googleBooksApi, 'getVolume').mockRejectedValue(new HttpError(404, 'Not Found'));

    const { result } = renderHook(() => useBookDetails('missing-id'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it('caches by bookId — calling the hook twice for the same id reuses the cache', async () => {
    const queryClient = createTestQueryClient();
    const sharedWrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const spy = vi.spyOn(googleBooksApi, 'getVolume').mockResolvedValue(makeVolume());

    const first = renderHook(() => useBookDetails('book-1'), { wrapper: sharedWrapper });
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true));

    const second = renderHook(() => useBookDetails('book-1'), { wrapper: sharedWrapper });
    await waitFor(() => expect(second.result.current.isSuccess).toBe(true));

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not retry a 4xx error (e.g. rate limit) — fails fast instead of hammering the API', async () => {
    const spy = vi.spyOn(googleBooksApi, 'getVolume').mockRejectedValue(new HttpError(429, 'Too Many Requests'));

    const { result } = renderHook(() => useBookDetails('book-1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
