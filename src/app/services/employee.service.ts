import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IEmployee } from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<IEmployee[]> {
    return this.http.get<IEmployee[]>(`${this.baseUrl}/employees`);
  }

  getDeletedEmployees(): Observable<IEmployee[]> {
    return this.http.get<IEmployee[]>(`${this.baseUrl}/employees/deleted`);
  }

  getEmployee(employeeId: string): Observable<IEmployee> {
    return this.http.get<IEmployee>(`${this.baseUrl}/employees/${employeeId}`);
  }

  getDeletedEmployee(employeeId: string): Observable<IEmployee> {
    return this.http.get<IEmployee>(`${this.baseUrl}/employees/${employeeId}/deleted`);
  }

  createEmployee(data: Partial<IEmployee>): Observable<IEmployee> {
    return this.http.post<IEmployee>(`${this.baseUrl}/employees`, data);
  }

  updateEmployee(employeeId: string, data: Partial<IEmployee>): Observable<IEmployee> {
    return this.http.put<IEmployee>(`${this.baseUrl}/employees/${employeeId}`, data);
  }

  softDeleteEmployee(employeeId: string): Observable<IEmployee> {
    return this.http.delete<IEmployee>(`${this.baseUrl}/employees/${employeeId}/soft`);
  }

  restoreEmployee(employeeId: string): Observable<IEmployee> {
    return this.http.patch<IEmployee>(`${this.baseUrl}/employees/${employeeId}/restore`, {});
  }

  hardDeleteEmployee(employeeId: string): Observable<IEmployee> {
    return this.http.delete<IEmployee>(`${this.baseUrl}/employees/${employeeId}/hard`);
  }
}
