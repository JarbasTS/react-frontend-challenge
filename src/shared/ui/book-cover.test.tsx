import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { BookCover } from './book-cover';

describe('BookCover', () => {
  it('renders the placeholder icon (not an <img>) when src is null', () => {
    render(<BookCover src={null} alt="Capa de Duna" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders an <img> with the correct src and alt when src is valid', () => {
    render(<BookCover src="https://example.com/cover.jpg" alt="Capa de Duna" />);
    const img = screen.getByRole('img', { name: 'Capa de Duna' });
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg');
  });

  it('falls back to the placeholder when the image fails to load', () => {
    render(<BookCover src="https://example.com/broken.jpg" alt="Capa de Duna" />);
    const img = screen.getByRole('img', { name: 'Capa de Duna' });

    fireEvent.error(img);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
