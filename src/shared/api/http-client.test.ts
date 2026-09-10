import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpError, httpGet, shouldRetryOnServerError } from './http-client';

describe('httpGet', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves with the parsed JSON body on a successful response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ hello: 'world' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await httpGet<{ hello: string }>('https://example.com');

    expect(result).toEqual({ hello: 'world' });
    expect(fetchMock).toHaveBeenCalledWith('https://example.com');
  });

  it('rejects with an HttpError carrying the status on a non-OK response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(httpGet('https://example.com')).rejects.toMatchObject({
      status: 429,
    });
    await expect(httpGet('https://example.com')).rejects.toBeInstanceOf(HttpError);
  });

  it('propagates the error when fetch itself rejects (network failure)', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(httpGet('https://example.com')).rejects.toThrow('network down');
  });
});

describe('shouldRetryOnServerError', () => {
  it('does not retry a 4xx HttpError (e.g. 429 rate limit)', () => {
    expect(shouldRetryOnServerError(0, new HttpError(429, 'Too Many Requests'))).toBe(false);
  });

  it('retries a non-HttpError up to 3 times', () => {
    expect(shouldRetryOnServerError(0, new Error('network down'))).toBe(true);
    expect(shouldRetryOnServerError(2, new Error('network down'))).toBe(true);
    expect(shouldRetryOnServerError(3, new Error('network down'))).toBe(false);
  });
});
