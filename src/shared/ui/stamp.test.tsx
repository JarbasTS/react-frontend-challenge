import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stamp } from './stamp';

describe('Stamp', () => {
  it('renders the given label', () => {
    render(<Stamp variant="want">Quero Ler</Stamp>);
    expect(screen.getByText('Quero Ler')).toBeInTheDocument();
  });

  it.each([
    ['want', 'want'],
    ['reading', 'reading'],
    ['done', 'done'],
    ['error', 'error'],
  ] as const)('exposes data-variant="%s" for the %s variant', (variant, expected) => {
    render(<Stamp variant={variant}>Status</Stamp>);
    expect(screen.getByText('Status')).toHaveAttribute('data-variant', expected);
  });
});
