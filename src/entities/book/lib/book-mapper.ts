import type { GoogleVolume } from '@shared/api/google-books.schema';
import type { Book, PrintType } from '../model/types';

function normalizePreviewLink(previewLink?: string): string | undefined {
  if (!previewLink) return undefined;
  return previewLink.replace(/^http:\/\//, 'https://');
}

function normalizePrintType(printType?: string): PrintType {
  if (printType === 'BOOK' || printType === 'MAGAZINE') return printType;
  return 'UNKNOWN';
}

export function toBook(volume: GoogleVolume): Book {
  const { volumeInfo } = volume;

  return {
    id: volume.id,
    title: volumeInfo.title,
    authors: volumeInfo.authors ?? [],
    publisher: volumeInfo.publisher,
    publishedDate: volumeInfo.publishedDate,
    description: volumeInfo.description,
    thumbnail: volumeInfo.imageLinks?.thumbnail ?? volumeInfo.imageLinks?.smallThumbnail ?? null,
    previewLink: normalizePreviewLink(volumeInfo.previewLink),
    printType: normalizePrintType(volumeInfo.printType),
    pageCount: volumeInfo.pageCount,
    categories: volumeInfo.categories ?? [],
  };
}
