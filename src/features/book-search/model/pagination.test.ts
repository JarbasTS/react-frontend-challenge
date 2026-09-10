import { describe, expect, it } from 'vitest';
import { getPaginationState } from './pagination';

describe('getPaginationState', () => {
  it('has no previous page on page 1', () => {
    expect(getPaginationState(1, 100, 20).hasPrevious).toBe(false);
  });

  it('has no next page when the current page already covers totalItems', () => {
    expect(getPaginationState(5, 100, 20).hasNext).toBe(false);
  });

  it('has both previous and next on an intermediate page', () => {
    const state = getPaginationState(2, 100, 20);
    expect(state.hasPrevious).toBe(true);
    expect(state.hasNext).toBe(true);
  });

  it('computes totalPages, with a floor of 1', () => {
    expect(getPaginationState(1, 45, 20).totalPages).toBe(3);
    expect(getPaginationState(1, 0, 20).totalPages).toBe(1);
  });
});
