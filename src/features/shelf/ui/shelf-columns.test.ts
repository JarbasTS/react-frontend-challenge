import { describe, expect, it } from 'vitest';
import type { LegacyRow as Row } from '@tanstack/react-table/legacy';
import type { ShelfBook, ShelfStatus } from '@entities/shelf/model/types';
import { statusSortingFn } from './shelf-columns';

function makeRow(status: ShelfStatus): Row<ShelfBook> {
  return { original: { status } } as Row<ShelfBook>;
}

describe('statusSortingFn', () => {
  it('orders want-to-read < reading < done', () => {
    const statuses: ShelfStatus[] = ['done', 'want-to-read', 'reading'];
    const sorted = [...statuses].sort(
      (a, b) => statusSortingFn(makeRow(a), makeRow(b))
    );

    expect(sorted).toEqual(['want-to-read', 'reading', 'done']);
  });
});
