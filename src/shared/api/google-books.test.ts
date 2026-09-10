import { afterEach, describe, expect, it, vi } from 'vitest';
import * as httpClient from './http-client';
import { getVolume, searchVolumes } from './google-books';

describe('searchVolumes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('does not send printType when it is "all"', async () => {
    const spy = vi
      .spyOn(httpClient, 'httpGet')
      .mockResolvedValue({ totalItems: 0 });

    await searchVolumes({ q: 'dune', printType: 'all' });

    const calledUrl = spy.mock.calls[0]?.[0] as string;
    expect(calledUrl).not.toContain('printType');
  });

  it('sends printType literally for "books" and "magazines"', async () => {
    const spy = vi
      .spyOn(httpClient, 'httpGet')
      .mockResolvedValue({ totalItems: 0 });

    await searchVolumes({ q: 'dune', printType: 'magazines' });

    const calledUrl = spy.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('printType=magazines');
  });

  it('only appends the API key when VITE_GOOGLE_BOOKS_API_KEY is set', async () => {
    vi.stubEnv('VITE_GOOGLE_BOOKS_API_KEY', 'test-key');
    const spy = vi
      .spyOn(httpClient, 'httpGet')
      .mockResolvedValue({ totalItems: 0 });

    await searchVolumes({ q: 'dune' });

    const calledUrl = spy.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('key=test-key');
  });

  it('propagates the error when httpGet rejects (e.g. rate limit)', async () => {
    vi.spyOn(httpClient, 'httpGet').mockRejectedValue(new httpClient.HttpError(429, 'Too Many Requests'));

    await expect(searchVolumes({ q: 'dune' })).rejects.toMatchObject({ status: 429 });
  });
});

describe('getVolume', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requests the volume by id and parses the response', async () => {
    vi.spyOn(httpClient, 'httpGet').mockResolvedValue({
      id: 'abc123',
      volumeInfo: { title: 'Dune' },
    });

    const result = await getVolume('abc123');

    expect(result.id).toBe('abc123');
    expect(result.volumeInfo.title).toBe('Dune');
  });
});
