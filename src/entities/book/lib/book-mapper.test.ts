import { describe, expect, it } from 'vitest';
import type { GoogleVolume } from '@shared/api/google-books.schema';
import { toBook } from './book-mapper';

function makeVolume(overrides: Partial<GoogleVolume['volumeInfo']> = {}): GoogleVolume {
  return {
    id: 'vol-1',
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

describe('toBook', () => {
  it('maps a complete volume to a fully populated Book', () => {
    const book = toBook(makeVolume());

    expect(book).toEqual({
      id: 'vol-1',
      title: 'Duna',
      authors: ['Frank Herbert'],
      publisher: 'Aleph',
      publishedDate: '1965-08-01',
      description: 'Uma história épica no planeta deserto Arrakis.',
      thumbnail: 'http://books.google.com/thumb.jpg',
      previewLink: 'https://books.google.com/preview',
      printType: 'BOOK',
      pageCount: 688,
      categories: ['Fiction'],
    });
  });

  it('sets thumbnail to null (never empty string) when imageLinks is absent', () => {
    const book = toBook(makeVolume({ imageLinks: undefined }));
    expect(book.thumbnail).toBeNull();
  });

  it('falls back to smallThumbnail when thumbnail is absent', () => {
    const book = toBook(
      makeVolume({ imageLinks: { smallThumbnail: 'http://books.google.com/small.jpg' } })
    );
    expect(book.thumbnail).toBe('http://books.google.com/small.jpg');
  });

  it('defaults authors to an empty array when absent', () => {
    const book = toBook(makeVolume({ authors: undefined }));
    expect(book.authors).toEqual([]);
  });

  it('does not throw and leaves fields undefined when description/publisher/publishedDate are absent', () => {
    expect(() =>
      toBook(
        makeVolume({ description: undefined, publisher: undefined, publishedDate: undefined })
      )
    ).not.toThrow();

    const book = toBook(
      makeVolume({ description: undefined, publisher: undefined, publishedDate: undefined })
    );
    expect(book.description).toBeUndefined();
    expect(book.publisher).toBeUndefined();
    expect(book.publishedDate).toBeUndefined();
  });

  it('maps an absent or unrecognized printType to UNKNOWN', () => {
    expect(toBook(makeVolume({ printType: undefined })).printType).toBe('UNKNOWN');
    expect(toBook(makeVolume({ printType: 'WEIRD_VALUE' })).printType).toBe('UNKNOWN');
  });

  it('normalizes an http:// previewLink to https://', () => {
    const book = toBook(makeVolume({ previewLink: 'http://books.google.com/preview' }));
    expect(book.previewLink).toBe('https://books.google.com/preview');
  });

  it('leaves previewLink undefined when absent', () => {
    const book = toBook(makeVolume({ previewLink: undefined }));
    expect(book.previewLink).toBeUndefined();
  });
});
