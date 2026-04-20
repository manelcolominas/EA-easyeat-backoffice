import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IVisit } from '../models/visit.model';
import { ApiClientService } from './api-client.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class VisitService {
  constructor(private api: ApiClientService) { }

  getVisitsByRestaurantId(restaurantId: string): Observable<IVisit[]> {
    return this.api
      .getAllPaginatedData<IVisit>('/visits', { restaurant_id: restaurantId })
      .pipe(map((res) => res.data));
  }

  getDeletedVisitsByRestaurantId(restaurantId: string): Observable<IVisit[]> {
    return this.api
      .getAllPaginatedData<IVisit>('/visits/deleted', { restaurant_id: restaurantId })
      .pipe(map((res) => res.data));
  }

  getVisitsByCustomerId(customerId: string): Observable<IVisit[]> {
    return this.api
      .getAllPaginatedData<IVisit>('/visits', { customer_id: customerId })
      .pipe(map((res) => res.data));
  }

  getDeletedVisitsByCustomerId(customerId: string): Observable<IVisit[]> {
    return this.api
      .getAllPaginatedData<IVisit>('/visits/deleted', { customer_id: customerId })
      .pipe(map((res) => res.data));
  }

  getVisitFull(visitId: string): Observable<IVisit> {
    return this.api.get<IVisit>(`/visits/${visitId}/full`);
  }

  getDeletedVisitFull(visitId: string): Observable<IVisit> {
    return this.api.get<IVisit>(`/visits/${visitId}/full/deleted`);
  }

  createVisit(data: Partial<IVisit>): Observable<IVisit> {
    return this.api.post<IVisit>('/visits', data);
  }

  /**
   * Actualizar visita (Usado tanto para edición normal como para SOFT DELETE)
   */
  updateVisit(visitId: string, data: any): Observable<IVisit> {
    return this.api.put<IVisit>(`/visits/${visitId}`, data);
  }

  softDeleteVisit(visitId: string): Observable<IVisit> {
    return this.api.delete<IVisit>(`/visits/${visitId}/soft`);
  }

  restoreVisit(visitId: string): Observable<IVisit> {
    return this.api.patch<IVisit>(`/visits/${visitId}/restore`, {});
  }

  hardDeleteVisit(visitId: string): Observable<IVisit> {
    return this.api.delete<IVisit>(`/visits/${visitId}/hard`);
  }
}
