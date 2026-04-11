import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface LoginResponse {
  message: string;
  accessToken: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  login(email: string, password: string): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { email, password }).pipe(
    tap(response => {
      if (response && response.accessToken && this.isBrowser) {
        localStorage.setItem('admin_token', response.accessToken); // ← Fix: response.token → response.accessToken
        localStorage.setItem('admin_user', JSON.stringify(response.admin));
      }
    })
  );
}

  logout() {
  this.http.post(`${this.baseUrl}/auth/logout`, {}).subscribe({
    complete: () => {
      if (this.isBrowser) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
  });
}

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('admin_token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser(): any {
    if (this.isBrowser) {
      const user = localStorage.getItem('admin_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }
}
