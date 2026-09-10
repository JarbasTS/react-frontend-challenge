export interface PaginationState {
  hasPrevious: boolean;
  hasNext: boolean;
  totalPages: number;
}

export function getPaginationState(page: number, totalItems: number, pageSize: number): PaginationState {
  return {
    hasPrevious: page > 1,
    hasNext: page * pageSize < totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
  };
}
