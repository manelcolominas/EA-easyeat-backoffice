import { Injectable, Injector, PLATFORM_ID, Inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isBrowser: boolean;

  constructor(
    private injector: Injector,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let token = null;
    
    if (this.isBrowser) {
      token = localStorage.getItem('admin_token');
    }

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          if (this.isBrowser) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
          }
          const router = this.injector.get(Router);
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
