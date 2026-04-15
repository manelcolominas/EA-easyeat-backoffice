import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRestaurant } from '../models/restaurant.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createRestaurant(data: Partial<IRestaurant>): Observable<IRestaurant> {
    return this.http.post<IRestaurant>(`${this.baseUrl}/restaurants`, data);
  }

  getRestaurant(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}`
    );
  }

  getDeletedRestaurant(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/deleted`
    );
  }

  getRestaurants(): Observable<IRestaurant[]> {
    return this.http.get<IRestaurant[]>(
      `${this.baseUrl}/restaurants`
    );
  }

  getDeletedRestaurants(): Observable<IRestaurant[]> {
    return this.http.get<IRestaurant[]>(
      `${this.baseUrl}/restaurants/deleted`
    );
  }

  updateRestaurant(restaurantId: string, data: Partial<IRestaurant>): Observable<IRestaurant> {
    return this.http.put<IRestaurant>(`${this.baseUrl}/restaurants/${restaurantId}`, data);
  }

  softDeleteRestaurant(restaurantId: string): Observable<IRestaurant> {
    return this.http.delete<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/soft`
    );
  }

  restoreRestaurant(restaurantId: string): Observable<IRestaurant> {
    return this.http.patch<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/restore`, {}
    );
  }

  hardDeleteRestaurant(restaurantId: string): Observable<IRestaurant> {
    return this.http.delete<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/hard`
    );
  }

  getRestaurantFull(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/full`
    );
  }

  getDeletedRestaurantFull(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/full/deleted`
    );
  }

  getNearbyRestaurants(lng: number, lat: number, maxDistance: number): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/nearby?lng=${lng}&lat=${lat}&maxDistance=${maxDistance}`
    );
  }

  getBadges(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/badges`
    );
  }

  getDeletedBadges(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/badges/deleted`
    );
  }

  getStatistics(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/statistics`
    );
  }

  getDeletedStatistics(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/statistics/deleted`
    );
  }

  getEmployees(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/employees`
    );
  }

  getDeletedEmployees(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/employees/deleted`
    );
  }

  getDishes(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/dishes`
    );
  }

  getDeletedDishes(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/dishes/deleted`
    );
  }

  getRewards(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/rewards`
    );
  }

  getDeletedRewards(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/rewards/deleted`
    );
  }

  getVisits(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/visits`
    );
  }

  getDeletedVisits(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/visits/deleted`
    );
  }

  getReviews(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/reviews`
    );
  }

  getDeletedReviews(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/reviews/deleted`
    );
  }
}