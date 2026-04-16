import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IReview } from '../models/review.model';
import { ApiClientService } from './api-client.service';
import { normalizeArrayResponse } from './api-response.util';
import { IDish } from '../models/dish.model';

// ========================
// TYPES EXTRA
// ========================

export interface IPaginatedReviews {
  data: IReview[];
  total: number;
}

export interface ITopDishInfo {
  dishId: string;
  name: string;
  averageRating?: number | null;
  totalRatings?: number | null;
}

export interface IRestaurantTopDishResponse {
  topDish: ITopDishInfo | null;
}

export interface IDishWithStats {
  dishId: string;
  name: string;
  images: string[];
  averageRating: number;
  totalRatings: number;
}

export interface IRestaurantDishesResponse {
  restaurant: {
    _id: string;
    name: string | null;
  };
  dishes: IDishWithStats[];
}

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
    return this.api.get<unknown>('/reviews').pipe(map((res) => normalizeArrayResponse<IReview>(res)));
  }

  getAllDeleted(): Observable<IReview[]> {
    return this.api.get<unknown>('/reviews/deleted').pipe(map((res) => normalizeArrayResponse<IReview>(res)));
  }

  // ========================
  // GET BY RESTAURANT
  // ========================
  getByRestaurant(restaurantId: string): Observable<IReview[]> {
    return this.api.get<unknown>(`/reviews/restaurant/${restaurantId}`).pipe(map((res) => normalizeArrayResponse<IReview>(res)));
  }

  getByDeletedRestaurant(restaurantId: string): Observable<IReview[]> {
    return this.api.get<unknown>(`/reviews/restaurant/${restaurantId}/deleted`).pipe(map((res) => normalizeArrayResponse<IReview>(res)));
  }

  // ========================
  // GET BY CUSTOMER (PAGINATED)
  // ========================
  getByCustomer(
    customerId: string,
    limit = 5,
    skip = 0,
    minGlobalRating?: number,
    sortByLikes?: boolean
  ): Observable<IPaginatedReviews> {
    return this.api.get<IPaginatedReviews>(`/reviews/customer/${customerId}`, {
      limit,
      skip,
      minGlobalRating,
      sortByLikes: sortByLikes ? true : undefined,
    });
  }

  getByDeletedCustomer(
    customerId: string,
    limit = 5,
    skip = 0,
    minGlobalRating?: number,
    sortByLikes?: boolean
  ): Observable<IPaginatedReviews> {
    return this.api.get<IPaginatedReviews>(`/reviews/customer/${customerId}/deleted`, {
      limit,
      skip,
      minGlobalRating,
      sortByLikes: sortByLikes ? true : undefined,
    });
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
  update(
    reviewId: string,
    review: Partial<IReview>
  ): Observable<IReview> {
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
  // LIKE
  // ========================
  like(reviewId: string, currentLikes: number): Observable<IReview> {
    return this.update(reviewId, { likes: currentLikes + 1 });
  }

  // ========================
  // TOP DISH
  // ========================
  getTopDish(restaurantId: string): Observable<IRestaurantTopDishResponse> {
    return this.api.get<any>(`/restaurants/${restaurantId}/top-dish`).pipe(
      map((dish) => ({
        topDish: dish
          ? {
              dishId: dish._id,
              name: dish.name ?? 'Unknown dish',
              averageRating: dish.averageRating ?? null,
              totalRatings: dish.totalRatings ?? null,
            }
          : null,
      }))
    );
  }

  // ========================
  // ALL DISHES WITH RATINGS
  // ========================
  getDishesWithRatings(
    restaurantId: string
  ): Observable<IRestaurantDishesResponse> {
    return this.api.get<{ _id?: string; dishes?: IDish[] }>(`/restaurants/${restaurantId}/dishes`).pipe(
      map((response) => ({
        restaurant: {
          _id: restaurantId,
          name: null,
        },
        dishes: (response?.dishes ?? []).map((dish) => ({
          dishId: dish._id ?? '',
          name: dish.name,
          images: dish.images ?? [],
          averageRating: 0,
          totalRatings: 0,
        })),
      }))
    );
  }
}
