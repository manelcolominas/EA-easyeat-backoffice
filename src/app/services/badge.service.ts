import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IBadge } from '../models/badge.model';
import { ApiClientService } from './api-client.service';
import { normalizeArrayResponse } from './api-response.util';

@Injectable({
  providedIn: 'root',
})
export class BadgeService {
  constructor(private api: ApiClientService) { }

  getBadges(): Observable<IBadge[]> {
    return this.api.get<unknown>('/badges').pipe(map((res) => normalizeArrayResponse<IBadge>(res)));
  }

  /** Gets all badges belonging to a restaurant via the restaurant endpoint */
  getBadgesByRestaurant(restaurantId: string): Observable<IBadge[]> {
    return this.api.get<any>(`/restaurants/${restaurantId}/badges`).pipe(
      map(res => {
        // Endpoint returns the restaurant object with a populated 'badges' array
        const badges = res?.badges ?? res ?? [];
        return Array.isArray(badges) ? badges : [];
      })
    );
  }

  /** Gets badges earned by a customer */
  getBadgesByCustomer(customerId: string): Observable<IBadge[]> {
    return this.api.get<unknown>(`/customers/${customerId}/badges`).pipe(
      map(res => normalizeArrayResponse<IBadge>(res))
    );
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
