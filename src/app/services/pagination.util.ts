import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PaginationUtils {
  getPaginatedData<T>(items: T[], page: number, limit: number): T[] {
    const start = (page - 1) * limit;
    return items.slice(start, start + limit);
  }

  getTotalPages(totalItems: number, limit: number): number {
    return Math.max(1, Math.ceil(totalItems / limit));
  }

  getSafePage(requestedPage: number, totalItems: number, limit: number): number {
    const totalPages = this.getTotalPages(totalItems, limit);
    return Math.min(Math.max(1, requestedPage), totalPages);
  }
}
