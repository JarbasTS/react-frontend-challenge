import { Link } from '@tanstack/react-router';
import { notifySuccess } from '@shared/lib/notify';
import {
  legacyCreateColumnHelper as createColumnHelper,
  type LegacyColumnDef as ColumnDef,
  type LegacyRow as Row,
} from '@tanstack/react-table/legacy';
import { STATUS_LABELS, type ShelfBook, type ShelfStatus } from '@entities/shelf/model/types';
import { useShelfStore } from '@features/shelf/model/shelf-store';
import { BookCover } from '@shared/ui/book-cover';
import { Button } from '@shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';

const STATUS_ORDER: ShelfStatus[] = ['want-to-read', 'reading', 'done'];

export function statusSortingFn(rowA: Row<ShelfBook>, rowB: Row<ShelfBook>): number {
  return STATUS_ORDER.indexOf(rowA.original.status) - STATUS_ORDER.indexOf(rowB.original.status);
}

const columnHelper = createColumnHelper<ShelfBook>();

// `any` é necessário aqui: colunas com tipos de valor heterogêneos (string, ShelfStatus, etc.)
// não unificam em `ColumnDef<ShelfBook, TValue>` por causa da variância do genérico — mesmo padrão usado pela própria lib em `ColumnDef<TData, any>[]`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const shelfColumns: ColumnDef<ShelfBook, any>[] = [
  columnHelper.display({
    id: 'cover',
    header: '',
    enableSorting: false,
    cell: ({ row }) => (
      <BookCover src={row.original.thumbnail} alt={`Capa de ${row.original.title}`} size="sm" />
    ),
  }),
  columnHelper.accessor('title', {
    header: 'Título',
  }),
  columnHelper.accessor((row) => (row.authors.length > 0 ? row.authors.join(', ') : ''), {
    id: 'authors',
    header: 'Autor',
    enableSorting: false,
    cell: ({ getValue }) => getValue() || 'Autor desconhecido',
  }),
  columnHelper.accessor('publishedDate', {
    header: 'Publicado em',
    enableSorting: false,
    cell: ({ getValue }) => getValue() ?? '—',
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    sortFn: statusSortingFn,
    cell: ({ row }) => {
      const book = row.original;
      return (
        <Select
          value={book.status}
          onValueChange={(value) => useShelfStore.getState().updateStatus(book.id, value as ShelfStatus)}
        >
          <SelectTrigger size="sm" className="w-32" aria-label={`Status de ${book.title}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_ORDER.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Ações',
    enableSorting: false,
    cell: ({ row }) => {
      const book = row.original;
      return (
        <div className="flex items-center gap-2">
          <Link to="/book/$bookId" params={{ bookId: book.id }}>
            <Button variant="outline" size="sm">
              Ver detalhes
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              useShelfStore.getState().removeBook(book.id);
              notifySuccess('Removido da estante.');
            }}
          >
            Remover
          </Button>
        </div>
      );
    },
  }),
];
