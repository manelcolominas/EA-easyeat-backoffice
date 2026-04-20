import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IReward } from '../models/reward.model';
import { ApiClientService } from './api-client.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RewardService {
  constructor(private api: ApiClientService) {}

  getRewards(): Observable<IReward[]> {
    return this.api.getAllPaginatedData<IReward>('/rewards').pipe(map((res) => res.data));
  }

  getDeletedRewards(): Observable<IReward[]> {
    return this.api.getAllPaginatedData<IReward>('/rewards/deleted').pipe(map((res) => res.data));
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
