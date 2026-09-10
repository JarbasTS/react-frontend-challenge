export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export async function httpGet<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new HttpError(response.status, `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/** Erros 4xx (ex.: 429 de rate limit) não se resolvem tentando de novo — falha rápido em vez de piorar o rate limit. */
export function shouldRetryOnServerError(failureCount: number, error: unknown): boolean {
  if (error instanceof HttpError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 3;
}
