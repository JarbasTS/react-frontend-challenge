import { useForm } from '@tanstack/react-form';
import type { SearchOrderBy, SearchPrintType } from '@shared/api/google-books';
import { Label } from '@shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';
import type { SearchFilters } from '../model/search-filters';

interface SearchFiltersFormProps {
  filters: SearchFilters;
  onFiltersChange: (changes: Partial<SearchFilters>) => void;
}

export function SearchFiltersForm({ filters, onFiltersChange }: SearchFiltersFormProps) {
  const form = useForm({
    defaultValues: { printType: filters.printType, orderBy: filters.orderBy },
  });

  return (
    <div className="flex flex-wrap gap-4">
      <form.Field name="printType">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor="printType">Tipo</Label>
            <Select
              value={field.state.value}
              onValueChange={(value: SearchPrintType) => {
                field.handleChange(value);
                onFiltersChange({ printType: value });
              }}
            >
              <SelectTrigger id="printType" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="books">Livros</SelectItem>
                <SelectItem value="magazines">Revistas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <form.Field name="orderBy">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor="orderBy">Ordenar por</Label>
            <Select
              value={field.state.value}
              onValueChange={(value: SearchOrderBy) => {
                field.handleChange(value);
                onFiltersChange({ orderBy: value });
              }}
            >
              <SelectTrigger id="orderBy" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevância</SelectItem>
                <SelectItem value="newest">Mais recentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>
    </div>
  );
}
