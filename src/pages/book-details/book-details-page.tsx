import { useNavigate, useParams } from '@tanstack/react-router';
import { useBookDetails } from '@entities/book/model/use-book-details';
import { useShelfStore } from '@features/shelf/model/shelf-store';
import { BookCover } from '@shared/ui/book-cover';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import { Skeleton } from '@shared/ui/skeleton';
import { Stamp } from '@shared/ui/stamp';
import { notifySuccess } from '@shared/lib/notify';

export function BookDetailsPage() {
  const { bookId } = useParams({ strict: false }) as { bookId: string };
  const navigate = useNavigate();
  const { data: book, isLoading, isError } = useBookDetails(bookId);
  const inShelf = useShelfStore((state) => state.isInShelf(bookId));
  const addBook = useShelfStore((state) => state.addBook);
  const removeBook = useShelfStore((state) => state.removeBook);

  function handleToggleShelf() {
    if (!book) return;
    if (inShelf) {
      removeBook(book.id);
      notifySuccess('Removido da estante.');
    } else {
      addBook(book);
      notifySuccess('Adicionado à estante.');
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 sm:flex-row">
        <Skeleton className="aspect-[2/3] w-48 shrink-0 rounded-sm" />
        <div className="flex-1 space-y-3 py-1">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-destructive/40 py-16 text-center">
        <Stamp variant="error">Livro não encontrado</Stamp>
        <p className="max-w-sm text-sm text-muted-foreground">
          Não foi possível carregar os dados deste livro. Ele pode não existir mais ou houve uma falha de rede.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate({ to: '/search' })}>
          Voltar para a busca
        </Button>
      </div>
    );
  }

  const authorsLabel = book.authors.length > 0 ? book.authors.join(', ') : 'Autor desconhecido';

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <BookCover
        src={book.thumbnail}
        alt={`Capa de ${book.title}`}
        size="lg"
        className="mx-auto w-40 sm:mx-0 sm:w-48"
      />

      <div className="min-w-0 flex-1 space-y-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">{book.title}</h1>
          <p className="text-muted-foreground">{authorsLabel}</p>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:max-w-sm">
          <dt className="text-muted-foreground">Editora</dt>
          <dd>{book.publisher ?? 'Editora não informada'}</dd>
          <dt className="text-muted-foreground">Publicado em</dt>
          <dd>{book.publishedDate ?? 'Data não informada'}</dd>
        </dl>

        {book.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {book.categories.map((category) => (
              <Badge key={category} variant="outline">
                {category}
              </Badge>
            ))}
          </div>
        )}

        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
          {book.description ?? 'Sinopse não disponível para este título.'}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button onClick={handleToggleShelf} variant={inShelf ? 'outline' : 'default'}>
            {inShelf ? 'Remover da estante' : 'Adicionar à estante'}
          </Button>
          {book.previewLink && (
            <a
              href={book.previewLink}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-secondary underline-offset-4 hover:underline"
            >
              Ver preview
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
