import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IReward } from '../models/reward.model';
import { ApiClientService } from './api-client.service';
import { map } from 'rxjs/operators';
import { normalizePaginatedResponse } from './api-response.util';

@Injectable({
  providedIn: 'root',
})
export class RewardService {
  constructor(private api: ApiClientService) { }

  getRewards(page: number, limit: number): Observable<any> {
    return this.api.get('/rewards', {
      page: page,
      limit: limit,
    }).pipe(map((res) => normalizePaginatedResponse<IReward>(res)));
  }

  getDeletedRewards(page: number, limit: number): Observable<any> {
    return this.api.get('/rewards/deleted', {
      page: page,
      limit: limit,
    }).pipe(map((res) => normalizePaginatedResponse<IReward>(res)));
  }

  getRewardsByRestaurant(restaurantId: string, page: number, limit: number): Observable<any> {
    return this.api.get(`/rewards/restaurant/${restaurantId}`, {
      page: page,
      limit: limit,
    }).pipe(map((res) => normalizePaginatedResponse<IReward>(res)));
  }

  getDeletedRewardsByRestaurant(restaurantId: string, page: number, limit: number): Observable<any> {
    return this.api.get(`/rewards/restaurant/${restaurantId}/deleted`, {
      page: page,
      limit: limit,
    }).pipe(map((res) => normalizePaginatedResponse<IReward>(res)));
  }

  getReward(rewardId: string): Observable<IReward> {
    return this.api.get<IReward>(`/rewards/${rewardId}`);
  }

  getDeletedReward(rewardId: string): Observable<IReward> {
    return this.api.get<IReward>(`/rewards/${rewardId}/deleted`);
  }

  createReward(data: Partial<IReward>): Observable<IReward> {
    return this.api.post<IReward>('/rewards', data);
  }

  updateReward(rewardId: string, data: Partial<IReward>): Observable<IReward> {
    return this.api.put<IReward>(`/rewards/${rewardId}`, data);
  }

  softDeleteReward(rewardId: string): Observable<IReward> {
    return this.api.delete<IReward>(`/rewards/${rewardId}/soft`);
  }

  restoreReward(rewardId: string): Observable<IReward> {
    return this.api.patch<IReward>(`/rewards/${rewardId}/restore`, {});
  }

  hardDeleteReward(rewardId: string): Observable<IReward> {
    return this.api.delete<IReward>(`/rewards/${rewardId}/hard`);
  }
}
