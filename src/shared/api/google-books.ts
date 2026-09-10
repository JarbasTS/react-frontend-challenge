import { httpGet } from './http-client';
import { searchResponseSchema, volumeSchema, type GoogleSearchResponse, type GoogleVolume } from './google-books.schema';

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

export type SearchPrintType = 'all' | 'books' | 'magazines';
export type SearchOrderBy = 'relevance' | 'newest';

export interface SearchVolumesParams {
  q: string;
  startIndex?: number;
  maxResults?: number;
  printType?: SearchPrintType;
  orderBy?: SearchOrderBy;
}

function buildSearchUrl({
  q,
  startIndex = 0,
  maxResults = 20,
  printType = 'all',
  orderBy = 'relevance',
}: SearchVolumesParams): string {
  const params = new URLSearchParams({ q, startIndex: String(startIndex), maxResults: String(maxResults) });

  // A API rejeita "all" — printType só deve ser enviado para books/magazines.
  if (printType !== 'all') {
    params.set('printType', printType);
  }
  if (orderBy !== 'relevance') {
    params.set('orderBy', orderBy);
  }

  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
  if (apiKey) {
    params.set('key', apiKey);
  }

  return `${BASE_URL}?${params.toString()}`;
}

export async function searchVolumes(params: SearchVolumesParams): Promise<GoogleSearchResponse> {
  const raw = await httpGet<unknown>(buildSearchUrl(params));
  return searchResponseSchema.parse(raw);
}

export async function getVolume(id: string): Promise<GoogleVolume> {
  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
  const url = apiKey
    ? `${BASE_URL}/${id}?key=${encodeURIComponent(apiKey)}`
    : `${BASE_URL}/${id}`;
  const raw = await httpGet<unknown>(url);
  return volumeSchema.parse(raw);
}
