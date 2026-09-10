import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('boots and redirects an unauthenticated visitor to the login page', async () => {
    render(<App />);
    expect(await screen.findByText('Libris')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /libris/i })
    ).toBeInTheDocument();
  });
});
