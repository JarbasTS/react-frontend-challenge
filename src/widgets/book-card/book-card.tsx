import { Link } from '@tanstack/react-router';
import type { Book } from '@entities/book/model/types';
import { useShelfStore } from '@features/shelf/model/shelf-store';
import { BookCover } from '@shared/ui/book-cover';
import { Button } from '@shared/ui/button';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const inShelf = useShelfStore((state) => state.isInShelf(book.id));
  const addBook = useShelfStore((state) => state.addBook);
  const removeBook = useShelfStore((state) => state.removeBook);

  const authorsLabel = book.authors.length > 0 ? book.authors.join(', ') : 'Autor desconhecido';

  return (
    <div className="flex gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground">
      <Link to="/book/$bookId" params={{ bookId: book.id }} className="shrink-0">
        <BookCover src={book.thumbnail} alt={`Capa de ${book.title}`} />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <Link to="/book/$bookId" params={{ bookId: book.id }} className="min-w-0">
          <p className="truncate font-display text-base font-semibold">{book.title}</p>
          <p className="truncate text-sm text-muted-foreground">{authorsLabel}</p>
        </Link>

        <Button
          type="button"
          variant={inShelf ? 'outline' : 'secondary'}
          size="sm"
          onClick={(event) => {
            event.preventDefault();
            if (inShelf) {
              removeBook(book.id);
            } else {
              addBook(book);
            }
          }}
        >
          {inShelf ? 'Remover da estante' : 'Adicionar à estante'}
        </Button>
      </div>
    </div>
  );
}
