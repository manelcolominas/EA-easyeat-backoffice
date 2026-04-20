import { PaginatedResponse } from '../models/pagination.models';

export interface IPaginatedData<T> extends PaginatedResponse<T> {
  total: number;
}

export const normalizeArrayResponse = <T>(response: unknown): T[] => {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (response && typeof response === 'object' && Array.isArray((response as { data?: unknown }).data)) {
    return (response as { data: T[] }).data;
  }

  return [];
};

export const normalizePaginatedResponse = <T>(response: unknown): IPaginatedData<T> => {
  const data = normalizeArrayResponse<T>(response);

  const rawMeta =
    response && typeof response === 'object'
      ? ((response as { meta?: unknown }).meta as Record<string, unknown> | undefined)
      : undefined;

  const fallbackTotalValue =
    response && typeof response === 'object' ? (response as { total?: unknown }).total : undefined;
  const fallbackTotal = typeof fallbackTotalValue === 'number' ? fallbackTotalValue : data.length;

  const total = typeof rawMeta?.['total'] === 'number' ? (rawMeta['total'] as number) : fallbackTotal;
  const page = typeof rawMeta?.['page'] === 'number' ? (rawMeta['page'] as number) : 1;
  const limit =
    typeof rawMeta?.['limit'] === 'number' && (rawMeta['limit'] as number) > 0
      ? (rawMeta['limit'] as number)
      : Math.max(1, data.length || 1);
  const totalPages =
    typeof rawMeta?.['totalPages'] === 'number'
      ? (rawMeta['totalPages'] as number)
      : Math.max(1, Math.ceil(total / limit));

  return {
    data,
    total,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

export const extractNestedEntity = <T>(response: unknown, key: string): T | null => {
  if (!response || typeof response !== 'object') {
    return null;
  }

  const candidate = (response as Record<string, unknown>)[key];
  return candidate ? (candidate as T) : null;
};
