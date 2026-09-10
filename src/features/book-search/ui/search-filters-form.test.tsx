import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_SEARCH_FILTERS } from '../model/search-filters';
import { SearchFiltersForm } from './search-filters-form';

describe('SearchFiltersForm', () => {
  it('calls onFiltersChange with printType: "magazines" when Revistas is selected', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    render(<SearchFiltersForm filters={DEFAULT_SEARCH_FILTERS} onFiltersChange={onFiltersChange} />);

    await user.click(screen.getByLabelText('Tipo'));
    await user.click(await screen.findByRole('option', { name: 'Revistas' }));

    expect(onFiltersChange).toHaveBeenCalledWith({ printType: 'magazines' });
  });

  it('calls onFiltersChange with orderBy: "newest" when Mais recentes is selected', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    render(<SearchFiltersForm filters={DEFAULT_SEARCH_FILTERS} onFiltersChange={onFiltersChange} />);

    await user.click(screen.getByLabelText('Ordenar por'));
    await user.click(await screen.findByRole('option', { name: 'Mais recentes' }));

    expect(onFiltersChange).toHaveBeenCalledWith({ orderBy: 'newest' });
  });
});
