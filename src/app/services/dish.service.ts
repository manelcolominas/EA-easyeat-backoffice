import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IDish } from '../models/dish.model';
import { ApiClientService } from './api-client.service';

export interface DishSummary {
  averageRating: number | null;
  totalRatings: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class DishService {
  constructor(private api: ApiClientService) {}

  // ─── GET ALL ─────────────────────────────────────────

  getDishes(page = 1, limit = 10): Observable<PaginatedResponse<IDish>> {
    return this.api.get<PaginatedResponse<IDish>>(`/dishes?page=${page}&limit=${limit}`);
  }

  getDeletedDishes(page = 1, limit = 10): Observable<PaginatedResponse<IDish>> {
    return this.api.get<PaginatedResponse<IDish>>(`/dishes/deleted?page=${page}&limit=${limit}`);
  }

  // ─── GET ONE ─────────────────────────────────────────

  getDish(dishId: string): Observable<IDish> {
    return this.api.get<IDish>(`/dishes/${dishId}`);
  }

  getDeletedDish(dishId: string): Observable<IDish> {
    return this.api.get<IDish>(`/dishes/${dishId}/deleted`);
  }

  // ─── CRUD ────────────────────────────────────────────

  createDish(data: Partial<IDish>): Observable<IDish> {
    return this.api.post<IDish>('/dishes', data);
  }

  updateDish(dishId: string, data: Partial<IDish>): Observable<IDish> {
    return this.api.put<IDish>(`/dishes/${dishId}`, data);
  }

  // ─── DELETE ──────────────────────────────────────────

  softDeleteDish(dishId: string): Observable<IDish> {
    return this.api.delete<IDish>(`/dishes/${dishId}/soft`);
  }

  restoreDish(dishId: string): Observable<IDish> {
    return this.api.patch<IDish>(`/dishes/${dishId}/restore`, {});
  }

  hardDeleteDish(dishId: string): Observable<IDish> {
    return this.api.delete<IDish>(`/dishes/${dishId}/hard`);
  }

  // ─── RATINGS ─────────────────────────────────────────

  getDishSummary(dishId: string): Observable<DishSummary> {
    return this.api.get<DishSummary>(`/dis-ratings/dish/${dishId}/summary`);
  }
}