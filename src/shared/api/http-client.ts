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
