import type { Book } from '@entities/book/model/types';

export type ShelfStatus = 'want-to-read' | 'reading' | 'done';

export interface ShelfBook extends Book {
  status: ShelfStatus;
  addedAt: string;
}

export const STATUS_LABELS: Record<ShelfStatus, string> = {
  'want-to-read': 'Quero Ler',
  reading: 'Lendo',
  done: 'Concluído',
};
