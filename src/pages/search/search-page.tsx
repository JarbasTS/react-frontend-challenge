import { useEffect, useRef } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { SearchIcon } from 'lucide-react';
import { resetPageOnFilterChange, type SearchFilters } from '@features/book-search/model/search-filters';
import { useBookSearch } from '@features/book-search/model/use-book-search';
import { getPaginationState } from '@features/book-search/model/pagination';
import { SearchInput } from '@features/book-search/ui/search-input';
import { SearchFiltersForm } from '@features/book-search/ui/search-filters-form';
import { BookCard } from '@widgets/book-card/book-card';
import { Button } from '@shared/ui/button';
import { Skeleton } from '@shared/ui/skeleton';
import { Stamp } from '@shared/ui/stamp';
import { notifyError } from '@shared/lib/notify';

export function SearchPage() {
  // Os filtros vivem na URL (search params da rota) em vez de useState local, para que
  // navegar até o detalhe de um livro e voltar preserve a busca em andamento.
  const filters = useSearch({ strict: false }) as SearchFilters;
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useBookSearch(filters);
  const wasError = useRef(false);

  useEffect(() => {
    if (isError && !wasError.current) {
      notifyError('Não foi possível buscar livros agora.');
    }
    wasError.current = isError;
  }, [isError]);

  function handleFiltersChange(changes: Partial<SearchFilters>) {
    navigate({
      to: '/search',
      search: (prev) => resetPageOnFilterChange(prev as SearchFilters, changes),
      replace: true,
    });
  }

  const hasQuery = filters.query.trim().length > 0;
  const pagination = data ? getPaginationState(filters.page, data.totalItems, 20) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <SearchInput
          value={filters.query}
          onChange={(query) => handleFiltersChange({ query })}
        />
        <SearchFiltersForm filters={filters} onFiltersChange={handleFiltersChange} />
      </div>

      {!hasQuery && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <SearchIcon aria-hidden="true" className="size-8 text-muted-foreground" />
          <p className="font-display text-lg">Digite algo para começar a explorar</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Busque por título, autor ou ISBN na base de dados do Google Books.
          </p>
        </div>
      )}

      {hasQuery && isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex gap-3 rounded-lg border border-border bg-card p-3">
              <Skeleton className="aspect-[2/3] w-24 shrink-0 rounded-sm" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          ))}
        </div>
      )}

      {hasQuery && !isLoading && isError && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-destructive/40 py-16 text-center">
          <Stamp variant="error">Falha na busca</Stamp>
          <p className="max-w-sm text-sm text-muted-foreground">
            Não foi possível carregar os resultados. Verifique sua conexão e tente novamente.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {hasQuery && !isLoading && !isError && data && data.totalItems === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="font-display text-lg">Nenhum resultado para &ldquo;{filters.query}&rdquo;</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Tente outro termo, ou ajuste os filtros de tipo e ordenação.
          </p>
        </div>
      )}

      {hasQuery && !isError && data && data.totalItems > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {pagination && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevious}
                onClick={() => handleFiltersChange({ page: filters.page - 1 })}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {filters.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() => handleFiltersChange({ page: filters.page + 1 })}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
