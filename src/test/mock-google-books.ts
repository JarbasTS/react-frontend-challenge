import type { GoogleSearchResponse, GoogleVolume } from '@shared/api/google-books.schema';

/** Volume completo, com todos os campos que a API pode retornar. */
export function mockCompleteVolume(overrides: Partial<GoogleVolume['volumeInfo']> = {}): GoogleVolume {
  return {
    id: 'book-1',
    volumeInfo: {
      title: 'Duna',
      authors: ['Frank Herbert'],
      publisher: 'Aleph',
      publishedDate: '1965-08-01',
      description: 'Uma história épica no planeta deserto Arrakis.',
      imageLinks: { thumbnail: 'http://books.google.com/thumb.jpg' },
      previewLink: 'http://books.google.com/preview',
      printType: 'BOOK',
      pageCount: 688,
      categories: ['Fiction'],
      ...overrides,
    },
  };
}

/** Volume "sujo": sem capa, sem autores e sem sinopse — cenário comum na API real. */
export function mockIncompleteVolume(overrides: Partial<GoogleVolume['volumeInfo']> = {}): GoogleVolume {
  return {
    id: 'book-2',
    volumeInfo: {
      title: 'Fundação',
      ...overrides,
    },
  };
}

export function mockSearchResponse(volumes: GoogleVolume[], totalItems = volumes.length): GoogleSearchResponse {
  return { totalItems, items: volumes };
}
