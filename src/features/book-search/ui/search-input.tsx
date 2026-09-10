import { SearchIcon } from 'lucide-react';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="max-w-md flex-1 space-y-1.5">
      <Label htmlFor="book-search">Buscar livros</Label>
      <div className="relative">
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="book-search"
          type="search"
          placeholder="Título, autor ou ISBN..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
