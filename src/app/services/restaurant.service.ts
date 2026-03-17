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

  constructor(private http: HttpClient) {}

  createRestaurant(data: Partial<IRestaurant>): Observable<IRestaurant> {
    return this.http.post<IRestaurant>(
      `${this.baseUrl}/restaurants`,
      { data }
    );
  }

  getRestaurant(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}`
    );
  }

  getRestaurants(): Observable<IRestaurant[]> {
    return this.http.get<IRestaurant[]>(
      `${this.baseUrl}/restaurants`
    );
  }

  updateRestaurant(restaurantId: string, data: Partial<IRestaurant>): Observable<IRestaurant> {
    return this.http.put<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}`,
      { data }
    );
  }

  deleteRestaurant(restaurantId: string): Observable<IRestaurant> {
    return this.http.delete<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}`
    );
  }

  getRestaurantWithCustomers(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}`
    );
  }

  getRestaurantFull(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/full`
    );
  }

  getNearbyRestaurants(lng: number, lat: number, maxDistance: number): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/neraby`
    );
  }

  getBadges(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/badges`
    );
  }

  getStatistics(restaurantId: string): Observable<IRestaurant> {
    return this.http.get<IRestaurant>(
      `${this.baseUrl}/restaurants/${restaurantId}/statistics`
    );
  }
}
