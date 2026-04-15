import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IDish } from '../models/dish.model';

@Injectable({
  providedIn: 'root',
})
export class DishService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDishes(): Observable<IDish[]> {
    return this.http.get<IDish[]>(`${this.baseUrl}/dishes`);
  }

  getDish(dishId: string): Observable<IDish> {
    return this.http.get<IDish>(`${this.baseUrl}/dishes/${dishId}`);
  }

  createDish(data: Partial<IDish>): Observable<IDish> {
    return this.http.post<IDish>(`${this.baseUrl}/dishes`, data);
  }

  updateDish(dishId: string, data: Partial<IDish>): Observable<IDish> {
    return this.http.put<IDish>(`${this.baseUrl}/dishes/${dishId}`, data);
  }

  deleteDish(dishId: string): Observable<IDish> {
    return this.http.delete<IDish>(`${this.baseUrl}/dishes/${dishId}`);
  }
}
