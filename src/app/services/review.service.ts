import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IReview } from '../models/review.model';
import { environment } from '../../environments/environment';

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
  averageRating: number;
  totalRatings: number;
}

export interface IRestaurantTopDishResponse {
  restaurantId: string;
  restaurantName: string;
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
  // GET BY CUSTOMER (PAGINATED)
  // ========================
  getByCustomer(
    customerId: string,
    limit = 5,
    skip = 0,
    minGlobalRating?: number,
    sortByLikes?: boolean
  ): Observable<IPaginatedReviews> {
    let url = `${this.baseUrl}/customer/${customerId}?limit=${limit}&skip=${skip}`;

    if (minGlobalRating !== undefined) {
      url += `&minGlobalRating=${minGlobalRating}`;
    }

    if (sortByLikes) {
      url += `&sortByLikes=true`;
    }

    return this.http.get<IPaginatedReviews>(url);
  }

  getByDeletedCustomer(
    customerId: string,
    limit = 5,
    skip = 0,
    minGlobalRating?: number,
    sortByLikes?: boolean
  ): Observable<IPaginatedReviews> {
    let url = `${this.baseUrl}/customer/${customerId}/deleted?limit=${limit}&skip=${skip}`;

    if (minGlobalRating !== undefined) {
      url += `&minGlobalRating=${minGlobalRating}`;
    }

    if (sortByLikes) {
      url += `&sortByLikes=true`;
    }

    return this.http.get<IPaginatedReviews>(url);
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

  // ========================
  // TOP DISH
  // ========================
  getTopDish(restaurantId: string): Observable<IRestaurantTopDishResponse> {
    return this.http.get<IRestaurantTopDishResponse>(
      `${environment.apiUrl}/statistics/restaurants/${restaurantId}/top-dish`
    );
  }

  // ========================
  // ALL DISHES WITH RATINGS
  // ========================
  getDishesWithRatings(
    restaurantId: string
  ): Observable<IRestaurantDishesResponse> {
    return this.http.get<IRestaurantDishesResponse>(
      `${this.baseUrl}/restaurant/${restaurantId}/dishes`
    );
  }
}
