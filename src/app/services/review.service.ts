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

  constructor(private http: HttpClient) {}

  // ========================
  // GET ALL
  // ========================
  getAll(): Observable<IReview[]> {
    return this.http.get<IReview[]>(this.baseUrl);
  }

  // ========================
  // GET BY RESTAURANT
  // ========================
  getByRestaurant(restaurantId: string): Observable<IReview[]> {
    return this.http.get<IReview[]>(
      `${this.baseUrl}/restaurant/${restaurantId}`
    );
  }

  // ========================
  // GET BY CUSTOMER 
  // ========================
 getByCustomer(
  customerId: string,
  limit = 5,
  skip = 0,
  minglobalRating?: number,
  sortByLikes?: boolean
) {
  let url = `${this.baseUrl}/customer/${customerId}?limit=${limit}&skip=${skip}`;

  if (minglobalRating) url += `&minglobalRating=${minglobalRating}`;
  if (sortByLikes) url += `&sortByLikes=true`;

  return this.http.get<{ data: IReview[]; total: number }>(url);
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
  delete(reviewId: string): Observable<IReview> {
    return this.http.delete<IReview>(
      `${this.baseUrl}/${reviewId}`
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