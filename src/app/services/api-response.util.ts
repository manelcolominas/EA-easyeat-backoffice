export interface IPaginatedData<T> {
  data: T[];
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
  if (response && typeof response === 'object') {
    const data = normalizeArrayResponse<T>(response);
    const totalValue = (response as { total?: unknown }).total;
    const total = typeof totalValue === 'number' ? totalValue : data.length;
    return { data, total };
  }

  const data = normalizeArrayResponse<T>(response);
  return { data, total: data.length };
};

export const extractNestedEntity = <T>(response: unknown, key: string): T | null => {
  if (!response || typeof response !== 'object') {
    return null;
  }

  const candidate = (response as Record<string, unknown>)[key];
  return candidate ? (candidate as T) : null;
};
