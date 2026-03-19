import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICustomer } from '../models/customer.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createCustomer(data: any) {
  return this.http.post(`${this.baseUrl}/customers`, data);
}

  getCustomerById(customerId: string): Observable<ICustomer> {
    return this.http.get<ICustomer>(
      `${this.baseUrl}/customers/${customerId}`
    );
  }

  getCustomers(): Observable<ICustomer[]> {
    return this.http.get<ICustomer[]>(
      `${this.baseUrl}/customers`
    );
  }

  updateCustomer(id: string, data: any): Observable<ICustomer> {
  return this.http.put<ICustomer>(
    `${this.baseUrl}/customers/${id}`,
    data   
  );
}

  deleteCustomer(customerId: string): Observable<ICustomer> {
    return this.http.delete<ICustomer>(
      `${this.baseUrl}/customers/${customerId}/soft`
    );
  }

  /*getCustomerWithRestaurant(customerId: string): Observable<ICustomer> {
    return this.http.get<ICustomer>(
      `${this.baseUrl}/customer/${customerId}`
    );
  }*/
}
