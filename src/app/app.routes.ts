import { Routes } from '@angular/router';
import { RestaurantList } from './restaurant-list/restaurant-list';
import { CustomerList } from './customer-list/customer-list';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'restaurants', component: RestaurantList, canActivate: [AuthGuard] },
  { path: 'customers', component: CustomerList, canActivate: [AuthGuard] },
];
