import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICustomer } from '../models/customer.model';
import { ApiClientService } from './api-client.service';
import { map } from 'rxjs/operators';
import { normalizePaginatedResponse } from './api-response.util';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private api: ApiClientService) {}

  createCustomer(data: Partial<ICustomer>): Observable<ICustomer> {
    return this.api.post<ICustomer>('/customers', data);
  }

  getCustomerById(customerId: string): Observable<ICustomer> {
    return this.api.get<ICustomer>(`/customers/${customerId}`);
  }

  getDeletedCustomerById(customerId: string): Observable<ICustomer> {
    return this.api.get<ICustomer>(`/customers/${customerId}/deleted`);
  }

  getCustomers(): Observable<ICustomer[]> {
    return this.api.get<unknown>('/customers').pipe(map((res) => normalizePaginatedResponse<ICustomer>(res).data));
  }

  getDeletedCustomers(): Observable<ICustomer[]> {
    return this.api.get<unknown>('/customers/deleted').pipe(map((res) => normalizePaginatedResponse<ICustomer>(res).data));
  }

  getFullCustomer(customerId: string): Observable<ICustomer> {
    return this.api.get<ICustomer>(`/customers/${customerId}/full`);
  }

  getFullDeletedCustomer(customerId: string): Observable<ICustomer> {
    return this.api.get<ICustomer>(`/customers/${customerId}/full/deleted`);
  }

  updateCustomer(id: string, data: any): Observable<ICustomer> {
    return this.api.put<ICustomer>(`/customers/${id}`, data);
  }

  softDeleteCustomer(customerId: string): Observable<ICustomer> {
    return this.api.delete<ICustomer>(`/customers/${customerId}/soft`);
  }

  restoreCustomer(customerId: string): Observable<ICustomer> {
    return this.api.patch<ICustomer>(`/customers/${customerId}/restore`, {});
  }

  hardDeleteCustomer(customerId: string): Observable<ICustomer> {
    return this.api.delete<ICustomer>(`/customers/${customerId}/hard`);
  }
}
