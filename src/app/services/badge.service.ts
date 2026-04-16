import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { IBadge } from '../models/badge.model';

@Injectable({
  providedIn: 'root',
})
export class BadgeService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBadges(): Observable<IBadge[]> {
    return this.http.get<IBadge[]>(`${this.baseUrl}/badges`);
  }

  /** Gets all badges belonging to a restaurant via the restaurant endpoint */
  getBadgesByRestaurant(restaurantId: string): Observable<IBadge[]> {
    return this.http.get<any>(`${this.baseUrl}/restaurants/${restaurantId}/badges`).pipe(
      map(res => {
        // Endpoint returns the restaurant object with a populated 'badges' array
        const badges = res?.badges ?? res?.data?.badges ?? res ?? [];
        return Array.isArray(badges) ? badges : [];
      })
    );
  }

  /** Gets badges earned by a customer */
  getBadgesByCustomer(customerId: string): Observable<IBadge[]> {
    return this.http.get<any>(`${this.baseUrl}/customer/${customerId}/badges`).pipe(
      map(res => res?.data ?? res ?? [])
    );
  }

  getBadge(badgeId: string): Observable<IBadge> {
    return this.http.get<IBadge>(`${this.baseUrl}/badges/${badgeId}`);
  }

  createBadge(data: Partial<IBadge>): Observable<IBadge> {
    return this.http.post<IBadge>(`${this.baseUrl}/badges`, data);
  }

  updateBadge(badgeId: string, data: Partial<IBadge>): Observable<IBadge> {
    return this.http.put<IBadge>(`${this.baseUrl}/badges/${badgeId}`, data);
  }

  softDeleteBadge(badgeId: string): Observable<IBadge> {
    return this.http.delete<IBadge>(`${this.baseUrl}/badges/${badgeId}/soft`);
  }

  restoreBadge(badgeId: string): Observable<IBadge> {
    return this.http.patch<IBadge>(`${this.baseUrl}/badges/${badgeId}/restore`, {});
  }

  hardDeleteBadge(badgeId: string): Observable<IBadge> {
    return this.http.delete<IBadge>(`${this.baseUrl}/badges/${badgeId}/hard`);
  }
}
