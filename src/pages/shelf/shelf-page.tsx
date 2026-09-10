import { Link } from '@tanstack/react-router';
import { useShelfStore } from '@features/shelf/model/shelf-store';
import { ShelfTable } from '@widgets/shelf-table/shelf-table';
import { Button } from '@shared/ui/button';
import { Stamp } from '@shared/ui/stamp';

export function ShelfPage() {
  const items = useShelfStore((state) => state.items);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
        <Stamp variant="want">Estante vazia</Stamp>
        <p className="font-display text-lg">Sua estante ainda não tem livros</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Busque um título, autor ou ISBN e adicione à estante para acompanhar sua leitura.
        </p>
        <Button asChild size="sm">
          <Link to="/search">Buscar livros</Link>
        </Button>
      </div>
    );
  }

  return <ShelfTable items={items} />;
}
