import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IRestaurant } from '../models/restaurant.model';
import { IBadge } from '../models/badge.model';
import { ApiClientService } from './api-client.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  constructor(private api: ApiClientService) {}

  createRestaurant(data: Partial<IRestaurant>): Observable<IRestaurant> {
    return this.api.post<IRestaurant>('/restaurants', data);
  }

  getRestaurant(restaurantId: string): Observable<IRestaurant> {
    return this.api.get<IRestaurant>(`/restaurants/${restaurantId}`);
  }

  getDeletedRestaurant(restaurantId: string): Observable<IRestaurant> {
    return this.api.get<IRestaurant>(`/restaurants/${restaurantId}/deleted`);
  }

  getRestaurants(): Observable<IRestaurant[]> {
    return this.api.getAllPaginatedData<IRestaurant>('/restaurants').pipe(map((res) => res.data));
  }

  getDeletedRestaurants(): Observable<IRestaurant[]> {
    return this.api.getAllPaginatedData<IRestaurant>('/restaurants/deleted').pipe(map((res) => res.data));
  }

  updateRestaurant(restaurantId: string, data: Partial<IRestaurant>): Observable<IRestaurant> {
    return this.api.put<IRestaurant>(`/restaurants/${restaurantId}`, data);
  }

  softDeleteRestaurant(restaurantId: string): Observable<IRestaurant> {
    return this.api.delete<IRestaurant>(`/restaurants/${restaurantId}/soft`);
  }

  restoreRestaurant(restaurantId: string): Observable<IRestaurant> {
    return this.api.patch<IRestaurant>(`/restaurants/${restaurantId}/restore`, {});
  }

  hardDeleteRestaurant(restaurantId: string): Observable<IRestaurant> {
    return this.api.delete<IRestaurant>(`/restaurants/${restaurantId}/hard`);
  }

  getRestaurantFull(restaurantId: string): Observable<IRestaurant> {
    return this.api.get<IRestaurant>(`/restaurants/${restaurantId}/full`);
  }

  getDeletedRestaurantFull(restaurantId: string): Observable<IRestaurant> {
    return this.api.get<IRestaurant>(`/restaurants/${restaurantId}/full/deleted`);
  }

  getNearbyRestaurants(lng: number, lat: number, maxDistance: number): Observable<IRestaurant> {
    return this.api.get<IRestaurant>('/restaurants/filter', { lng, lat, radiusMeters: maxDistance });
  }

  getBadges(restaurantId: string): Observable<IBadge[]> {
    return this.api
      .getAllPaginatedData<IBadge>(`/badges/restaurant/${restaurantId}`)
      .pipe(map((res) => res.data));
  }

  getDeletedBadges(restaurantId: string): Observable<IBadge[]> {
    return this.api
      .getAllPaginatedData<IBadge>(`/badges/restaurant/${restaurantId}/deleted`)
      .pipe(map((res) => res.data));
  }

  getStatistics(restaurantId: string): Observable<IRestaurant> {
    return this.api.get<IRestaurant>(`/restaurants/${restaurantId}/statistics`);
  }

  getDeletedStatistics(restaurantId: string): Observable<IRestaurant> {
    return this.api.get<IRestaurant>(`/restaurants/${restaurantId}/statistics/deleted`);
  }

  getEmployees(restaurantId: string): Observable<IRestaurant> {
    return this.api.get<IRestaurant>(`/restaurants/${restaurantId}/employees`);
  }

  getDeletedEmployees(restaurantId: string): Observable<IRestaurant> {
    return this.api.get<IRestaurant>(`/restaurants/${restaurantId}/employees/deleted`);
  }

  getDishes(restaurantId: string): Observable<IRestaurant> {
    return this.api.get<IRestaurant>(`/restaurants/${restaurantId}/dishes`);
  }

  getDeletedDishes(restaurantId: string): Observable<IRestaurant> {
    return this.api.get<IRestaurant>(`/restaurants/${restaurantId}/dishes/deleted`);
  }

  getRewards(restaurantId: string): Observable<IRestaurant> {
    return this.api.get<IRestaurant>(`/restaurants/${restaurantId}/rewards`);
  }

  getDeletedRewards(restaurantId: string): Observable<IRestaurant> {
    return this.api.get<IRestaurant>(`/restaurants/${restaurantId}/rewards/deleted`);
  }

  getVisits(restaurantId: string): Observable<IRestaurant> {
    return this.api.get<IRestaurant>(`/restaurants/${restaurantId}/visits`);
  }

  getDeletedVisits(restaurantId: string): Observable<IRestaurant> {
    return this.api.get<IRestaurant>(`/restaurants/${restaurantId}/visits/deleted`);
  }

  getReviews(restaurantId: string): Observable<IRestaurant> {
    return this.api.get<IRestaurant>(`/restaurants/${restaurantId}/reviews`);
  }

  getDeletedReviews(restaurantId: string): Observable<IRestaurant> {
    return this.api.get<IRestaurant>(`/restaurants/${restaurantId}/reviews/deleted`);
  }
}
