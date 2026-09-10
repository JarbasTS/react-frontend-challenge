import { beforeEach, describe, expect, it } from 'vitest';
import { useThemeStore } from './theme-store';

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' });
  });

  it('starts with theme "light"', () => {
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('toggleTheme alternates between light and dark', () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('dark');

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('persists the theme to localStorage under "libris-theme"', () => {
    useThemeStore.getState().toggleTheme();
    const stored = localStorage.getItem('libris-theme');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored as string).state.theme).toBe('dark');
  });
});
