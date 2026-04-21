import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IDish } from '../models/dish.model';
import { ApiClientService } from './api-client.service';
import { map } from 'rxjs/operators';
import { normalizePaginatedResponse } from './api-response.util';

@Injectable({
  providedIn: 'root',
})
export class DishService {
  constructor(private api: ApiClientService) { }

  getDishes(): Observable<IDish[]> {
    return this.api.getAllPaginatedData<IDish>('/dishes').pipe(map((res) => res.data));
  }

  getDeletedDishes(): Observable<IDish[]> {
    return this.api.getAllPaginatedData<IDish>('/dishes/deleted').pipe(map((res) => res.data));
  }

  getDishesByRestaurantId(restaurantId: string, page: number, limit: number): Observable<any> {
    return this.api
      .get(`/dishes/restaurant/${restaurantId}`, {
        page: page,
        limit: limit,
      })
      .pipe(map((res) => normalizePaginatedResponse<IDish>(res)));
  }

  getDeletedDishesByRestaurantId(restaurantId: string, page: number, limit: number): Observable<any> {
    return this.api
      .get(`/dishes/restaurant/${restaurantId}/deleted`, {
        page: page,
        limit: limit,
      })
      .pipe(map((res) => normalizePaginatedResponse<IDish>(res)));
  }

  getDish(dishId: string): Observable<IDish> {
    return this.api.get<IDish>(`/dishes/${dishId}`);
  }

  getDeletedDish(dishId: string): Observable<IDish> {
    return this.api.get<IDish>(`/dishes/${dishId}/deleted`);
  }

  createDish(data: Partial<IDish>): Observable<IDish> {
    return this.api.post<IDish>('/dishes', data);
  }

  updateDish(dishId: string, data: Partial<IDish>): Observable<IDish> {
    return this.api.put<IDish>(`/dishes/${dishId}`, data);
  }

  softDeleteDish(dishId: string): Observable<IDish> {
    return this.api.delete<IDish>(`/dishes/${dishId}/soft`);
  }

  restoreDish(dishId: string): Observable<IDish> {
    return this.api.patch<IDish>(`/dishes/${dishId}/restore`, {});
  }

  hardDeleteDish(dishId: string): Observable<IDish> {
    return this.api.delete<IDish>(`/dishes/${dishId}/hard`);
  }
}
