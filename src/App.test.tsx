import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@test/render-with-providers';
import { App } from './App';

describe('App', () => {
  it('renders without crashing', () => {
    renderWithProviders(<App />);
    expect(screen.getByText('Libris')).toBeInTheDocument();
  });
});
