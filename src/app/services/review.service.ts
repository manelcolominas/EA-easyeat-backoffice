import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IReview } from '../models/review.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private baseUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) { }

  // ========================
  // GET ALL
  // ========================
  getAll(): Observable<IReview[]> {
    return this.http.get<IReview[]>(this.baseUrl);
  }

  getAllDeleted(): Observable<IReview[]> {
    return this.http.get<IReview[]>(`${this.baseUrl}/deleted`);
  }

  // ========================
  // GET BY RESTAURANT
  // ========================
  getByRestaurant(restaurantId: string): Observable<IReview[]> {
    return this.http.get<IReview[]>(
      `${this.baseUrl}/restaurant/${restaurantId}`
    );
  }

  getByDeletedRestaurant(restaurantId: string): Observable<IReview[]> {
    return this.http.get<IReview[]>(
      `${this.baseUrl}/restaurant/${restaurantId}/deleted`
    );
  }

  // ========================
  // GET BY CUSTOMER - FULL LIST (NO QUERY PARAMS)
  // ========================
  getByCustomer(customerId: string): Observable<IReview[]> {
    return this.http.get<IReview[]>(
      `${this.baseUrl}/customers/${customerId}`
    );
  }

  getDeletedByCustomer(customerId: string): Observable<IReview[]> {
    return this.http.get<IReview[]>(
      `${environment}/customers/${customerId}/deleted`
    );
  }

  // ========================
  // CREATE
  // ========================
  create(review: Partial<IReview>): Observable<IReview> {
    return this.http.post<IReview>(this.baseUrl, review);
  }

  // ========================
  // UPDATE
  // ========================
  update(
    reviewId: string,
    review: Partial<IReview>
  ): Observable<IReview> {
    return this.http.put<IReview>(
      `${this.baseUrl}/${reviewId}`,
      review
    );
  }

  // ========================
  // DELETE
  // ========================
  softDelete(reviewId: string): Observable<IReview> {
    return this.http.delete<IReview>(
      `${this.baseUrl}/${reviewId}/soft`
    );
  }

  restoreDelete(reviewId: string): Observable<IReview> {
    return this.http.patch<IReview>(
      `${this.baseUrl}/${reviewId}/restore`, {}
    );
  }

  hardDelete(reviewId: string): Observable<IReview> {
    return this.http.delete<IReview>(
      `${this.baseUrl}/${reviewId}/hard`
    );
  }

  // ========================
  // LIKE
  // ========================
  like(reviewId: string): Observable<IReview> {
    return this.http.post<IReview>(
      `${this.baseUrl}/${reviewId}/like`,
      {}
    );
  }
}
