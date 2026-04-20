import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { expand, map, reduce } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PaginatedResponse } from '../models/pagination.models';
import { normalizePaginatedResponse } from './api-response.util';

type QueryParams = Record<string, string | number | boolean | null | undefined>;

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(path: string, query?: QueryParams): Observable<T> {
    return this.http.get<T>(this.buildUrl(path), { params: this.toHttpParams(query) });
  }

  getAllPaginatedData<T>(
    path: string,
    query?: QueryParams,
    defaultLimit = 50,
  ): Observable<PaginatedResponse<T>> {
    const firstPage = 1;
    const firstQuery = { ...query, page: firstPage, limit: defaultLimit };

    return this.get<unknown>(path, firstQuery).pipe(
      map((response) => normalizePaginatedResponse<T>(response)),
      expand((currentPageResponse) => {
        if (currentPageResponse.meta.page >= currentPageResponse.meta.totalPages) {
          return EMPTY;
        }

        return this.get<unknown>(path, {
          ...query,
          page: currentPageResponse.meta.page + 1,
          limit: currentPageResponse.meta.limit,
        }).pipe(map((response) => normalizePaginatedResponse<T>(response)));
      }),
      reduce<PaginatedResponse<T>, PaginatedResponse<T> | null>(
        (acc, pageResponse) => {
          if (!acc) {
            return {
              data: [...pageResponse.data],
              meta: pageResponse.meta,
            };
          }

          acc.data.push(...pageResponse.data);
          acc.meta = pageResponse.meta;
          return acc;
        },
        null,
      ),
      map((result) => {
        if (!result) {
          return {
            data: [],
            meta: {
              total: 0,
              page: 1,
              limit: defaultLimit,
              totalPages: 1,
            },
          };
        }

        const total = result.meta.total || result.data.length;
        const totalPages = result.meta.totalPages || Math.max(1, Math.ceil(total / Math.max(1, result.meta.limit)));

        return {
          data: result.data,
          meta: {
            total,
            page: totalPages,
            limit: result.meta.limit || defaultLimit,
            totalPages,
          },
        };
      }),
    );
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.buildUrl(path), body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.buildUrl(path), body);
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(this.buildUrl(path), body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.buildUrl(path));
  }

  private buildUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${normalizedPath}`;
  }

  private toHttpParams(query?: QueryParams): HttpParams {
    let params = new HttpParams();
    if (!query) return params;

    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      params = params.set(key, String(value));
    }

    return params;
  }
}
