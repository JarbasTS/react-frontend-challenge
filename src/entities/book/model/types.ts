export type PrintType = 'BOOK' | 'MAGAZINE' | 'UNKNOWN';

export interface Book {
  id: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  /** `null` quando a API não retorna nenhuma capa — nunca uma string vazia. */
  thumbnail: string | null;
  previewLink?: string;
  printType: PrintType;
  pageCount?: number;
  categories: string[];
}
