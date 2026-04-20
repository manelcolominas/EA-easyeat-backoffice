export interface PaginationState {
  currentPage: number; // 1-based index for UI
  limit: number;
  totalItems: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
