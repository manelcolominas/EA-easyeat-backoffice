import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IEmployee } from '../models/employee.model';
import { ApiClientService } from './api-client.service';
import { map } from 'rxjs/operators';
import { IDish } from '../models/dish.model';
import { normalizePaginatedResponse } from './api-response.util';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  constructor(private api: ApiClientService) { }

  getEmployees(): Observable<IEmployee[]> {
    return this.api.getAllPaginatedData<IEmployee>('/employees').pipe(map((res) => res.data));
  }

  getDeletedEmployees(): Observable<IEmployee[]> {
    return this.api.getAllPaginatedData<IEmployee>('/employees/deleted').pipe(map((res) => res.data));
  }

  getEmployeesByRestaurantId(restaurantId: string, page: number, limit: number): Observable<any> {
    return this.api
      .get(`/employees/restaurant/${restaurantId}`, {
        page: page,
        limit: limit,
      })
      .pipe(map((res) => normalizePaginatedResponse<IEmployee>(res)));
  }

  getDeletedEmployeesByRestaurantId(restaurantId: string, page: number, limit: number): Observable<any> {
    return this.api
      .get(`/employees/restaurant/${restaurantId}/deleted`, {
        page: page,
        limit: limit,
      })
      .pipe(map((res) => normalizePaginatedResponse<IEmployee>(res)));
  }

  getEmployee(employeeId: string): Observable<IEmployee> {
    return this.api.get<IEmployee>(`/employees/${employeeId}`);
  }

  getDeletedEmployee(employeeId: string): Observable<IEmployee> {
    return this.api.get<IEmployee>(`/employees/${employeeId}/deleted`);
  }

  createEmployee(data: Partial<IEmployee>): Observable<IEmployee> {
    return this.api.post<IEmployee>('/employees', data);
  }

  updateEmployee(employeeId: string, data: Partial<IEmployee>): Observable<IEmployee> {
    return this.api.put<IEmployee>(`/employees/${employeeId}`, data);
  }

  softDeleteEmployee(employeeId: string): Observable<IEmployee> {
    return this.api.delete<IEmployee>(`/employees/${employeeId}/soft`);
  }

  restoreEmployee(employeeId: string): Observable<IEmployee> {
    return this.api.patch<IEmployee>(`/employees/${employeeId}/restore`, {});
  }

  hardDeleteEmployee(employeeId: string): Observable<IEmployee> {
    return this.api.delete<IEmployee>(`/employees/${employeeId}/hard`);
  }
}
