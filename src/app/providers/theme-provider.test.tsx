import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useThemeStore } from '@shared/lib/theme-store';
import { ThemeProvider } from './theme-provider';

describe('ThemeProvider', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' });
    document.documentElement.classList.remove('dark');
  });

  it('adiciona a classe "dark" ao <html> quando o tema é dark', () => {
    useThemeStore.setState({ theme: 'dark' });
    render(<ThemeProvider>conteúdo</ThemeProvider>);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('remove a classe "dark" do <html> quando o tema é light', () => {
    document.documentElement.classList.add('dark');
    useThemeStore.setState({ theme: 'light' });
    render(<ThemeProvider>conteúdo</ThemeProvider>);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
