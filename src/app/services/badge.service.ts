import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IBadge } from '../models/badge.model';
import { ApiClientService } from './api-client.service';
import { normalizePaginatedResponse } from './api-response.util';

@Injectable({
  providedIn: 'root',
})
export class BadgeService {
  constructor(private api: ApiClientService) { }

  getBadges(): Observable<IBadge[]> {
    return this.api.getAllPaginatedData<IBadge>('/badges').pipe(map((res) => res.data));
  }

  getBadgesByRestaurantId(restaurantId: string, page: number, limit: number): Observable<any> {
    return this.api
      .get(`/badges/restaurant/${restaurantId}`, {
        page: page,
        limit: limit,
      })
      .pipe(map((res) => normalizePaginatedResponse<IBadge>(res)));
  }

  getDeletedBadgesByRestaurantId(restaurantId: string, page: number, limit: number): Observable<any> {
    return this.api
      .get(`/badges/restaurant/${restaurantId}/deleted`, {
        page: page,
        limit: limit,
      })
      .pipe(map((res) => normalizePaginatedResponse<IBadge>(res)));
  }

  getBadgesByCustomerId(customerId: string, page: number, limit: number): Observable<IBadge[]> {
    return this.api
      .getAllPaginatedData<IBadge>(`/badges/customer/${customerId}`, {
        page: page,
        limit: limit,
      })
      .pipe(map((res) => res.data));
  }

  getDeletedBadgesByCustomerId(customerId: string, page: number, limit: number): Observable<IBadge[]> {
    return this.api
      .getAllPaginatedData<IBadge>(`/badges/customer/${customerId}/deleted`, {
        page: page,
        limit: limit,
      })
      .pipe(map((res) => res.data));
  }

  getBadge(badgeId: string): Observable<IBadge> {
    return this.api.get<IBadge>(`/badges/${badgeId}`);
  }

  createBadge(data: Partial<IBadge>): Observable<IBadge> {
    return this.api.post<IBadge>('/badges', data);
  }

  updateBadge(badgeId: string, data: Partial<IBadge>): Observable<IBadge> {
    return this.api.put<IBadge>(`/badges/${badgeId}`, data);
  }

  softDeleteBadge(badgeId: string): Observable<IBadge> {
    return this.api.delete<IBadge>(`/badges/${badgeId}/soft`);
  }

  restoreBadge(badgeId: string): Observable<IBadge> {
    return this.api.patch<IBadge>(`/badges/${badgeId}/restore`, {});
  }

  hardDeleteBadge(badgeId: string): Observable<IBadge> {
    return this.api.delete<IBadge>(`/badges/${badgeId}/hard`);
  }
}
