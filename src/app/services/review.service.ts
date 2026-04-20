import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IReview } from '../models/review.model';
import { ApiClientService } from './api-client.service';
import { IPaginatedData, normalizePaginatedResponse } from './api-response.util';
import { IDish } from '../models/dish.model';


// ========================
// TYPES EXTRA
// ========================

export interface IPaginatedReviews extends IPaginatedData<IReview> {}

// ========================
// SERVICE
// ========================

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  constructor(private api: ApiClientService) {}

  // ========================
  // GET ALL
  // ========================
  getAll(): Observable<IReview[]> {
    return this.api.getAllPaginatedData<IReview>('/reviews').pipe(map((res) => res.data));
  }

  getAllDeleted(): Observable<IReview[]> {
    return this.api.getAllPaginatedData<IReview>('/reviews/deleted').pipe(map((res) => res.data));
  }

  // ========================
  // GET BY RESTAURANT
  // ========================
  getByRestaurant(restaurantId: string): Observable<IReview[]> {
    return this.api
      .getAllPaginatedData<IReview>(`/reviews/restaurant/${restaurantId}`)
      .pipe(map((res) => res.data));
  }

  getByDeletedRestaurant(restaurantId: string): Observable<IReview[]> {
    return this.api
      .getAllPaginatedData<IReview>(`/reviews/restaurant/${restaurantId}/deleted`)
      .pipe(map((res) => res.data));
  }

  // ========================
  // GET BY CUSTOMER (PAGINATED)
  // ========================
  getByCustomer(
    customerId: string,
    limit = 5,
    skip = 0,
    minGlobalRating?: number,
    sortByLikes?: boolean,
  ): Observable<IPaginatedReviews> {
    const safeLimit = Math.max(1, limit);
    const page = Math.floor(Math.max(0, skip) / safeLimit) + 1;
    return this.api.get<unknown>(`/reviews/customer/${customerId}`, {
      page,
      limit: safeLimit,
      minGlobalRating,
      sortByLikes: sortByLikes ? true : undefined,
    }).pipe(map((res) => normalizePaginatedResponse<IReview>(res)));
  }

  getByDeletedCustomer(
    customerId: string,
    limit = 5,
    skip = 0,
    minGlobalRating?: number,
    sortByLikes?: boolean,
  ): Observable<IPaginatedReviews> {
    const safeLimit = Math.max(1, limit);
    const page = Math.floor(Math.max(0, skip) / safeLimit) + 1;
    return this.api.get<unknown>(`/reviews/customer/${customerId}/deleted`, {
      page,
      limit: safeLimit,
      minGlobalRating,
      sortByLikes: sortByLikes ? true : undefined,
    }).pipe(map((res) => normalizePaginatedResponse<IReview>(res)));
  }

  // ========================
  // CREATE
  // ========================
  create(review: Partial<IReview>): Observable<IReview> {
    return this.api.post<IReview>('/reviews', review);
  }

  // ========================
  // UPDATE
  // ========================
  update(reviewId: string, review: Partial<IReview>): Observable<IReview> {
    return this.api.put<IReview>(`/reviews/${reviewId}`, review);
  }

  // ========================
  // DELETE
  // ========================
  softDelete(reviewId: string): Observable<IReview> {
    return this.api.delete<IReview>(`/reviews/${reviewId}/soft`);
  }

  restoreDelete(reviewId: string): Observable<IReview> {
    return this.api.patch<IReview>(`/reviews/${reviewId}/restore`, {});
  }

  hardDelete(reviewId: string): Observable<IReview> {
    return this.api.delete<IReview>(`/reviews/${reviewId}/hard`);
  }

  // ========================
  // TOP DISH
  // ========================
  getTopDish(restaurantId: string): Observable<IDish | null> {
    return this.api.get<IDish | null>(`/restaurants/${restaurantId}/top-dish`).pipe(
      map((dish) => {
        return dish;
      }),
    );
  }
}
