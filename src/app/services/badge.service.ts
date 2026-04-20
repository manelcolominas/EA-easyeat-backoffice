import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IBadge } from '../models/badge.model';
import { ApiClientService } from './api-client.service';

@Injectable({
  providedIn: 'root',
})
export class BadgeService {
  constructor(private api: ApiClientService) { }

  getBadges(): Observable<IBadge[]> {
    return this.api.getAllPaginatedData<IBadge>('/badges').pipe(map((res) => res.data));
  }

  /** Gets all badges belonging to a restaurant */
  getBadgesByRestaurant(restaurantId: string): Observable<IBadge[]> {
    return this.api
      .getAllPaginatedData<IBadge>(`/badges/restaurant/${restaurantId}`)
      .pipe(map((res) => res.data));
  }

  /** Gets badges earned by a customer */
  getBadgesByCustomer(customerId: string): Observable<IBadge[]> {
    return this.api
      .getAllPaginatedData<IBadge>(`/customers/${customerId}/badges`)
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
