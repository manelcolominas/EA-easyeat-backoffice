export interface PaginationState {
  currentPage: number; // 1-based index for UI
  limit: number;
  totalItems: number;
}
