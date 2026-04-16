import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IReward } from '../models/reward.model';

@Injectable({
  providedIn: 'root',
})
export class RewardService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRewards(): Observable<IReward[]> {
    return this.http.get<IReward[]>(`${this.baseUrl}/rewards`)
  }

  getDeletedRewards(): Observable<IReward[]> {
    return this.http.get<IReward[]>(`${this.baseUrl}/rewards/deleted`)
  }

  getReward(rewardId: string): Observable<IReward> {
    return this.http.get<IReward>(`${this.baseUrl}/${rewardId}`)
  }
  
  getDeletedReward(rewardId: string): Observable<IReward> {
    return this.http.get<IReward>(`${this.baseUrl}/${rewardId}/deleted`)
  }

  createReward(data: Partial<IReward>): Observable<IReward> {
    return this.http.post<IReward>(`${this.baseUrl}/rewards`, data);
  }

  updateReward(rewardId: string, data: Partial<IReward>): Observable<IReward> {
    return this.http.put<IReward>(`${this.baseUrl}/rewards/${rewardId}`, data);
  }

  softDeleteReward(rewardId: string): Observable<IReward> {
    return this.http.delete<IReward>(`${this.baseUrl}/rewards/${rewardId}/soft`);
  }

  restoreReward(rewardId: string): Observable<IReward> {
    return this.http.patch<IReward>(`${this.baseUrl}/rewards/${rewardId}/restore`, {});
  }

  hardDeleteReward(rewardId: string): Observable<IReward> {
    return this.http.delete<IReward>(`${this.baseUrl}/rewards/${rewardId}/hard`);
  }
}
