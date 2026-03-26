import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { PropertiesComponent } from './pages/properties/properties.component';
import { PropertyDetailComponent } from './pages/property-detail/property-detail.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { OwnerDashboardComponent } from './pages/owner-dashboard/owner-dashboard.component';
import { OwnerPropertyFormComponent } from './pages/owner-property-form/owner-property-form.component';
import { AuthGuard, OwnerGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'properties', component: PropertiesComponent },
  { path: 'properties/:id', component: PropertyDetailComponent },
  { path: 'reservations', component: ReservationsComponent, canActivate: [AuthGuard] },
  { path: 'messages', component: MessagesComponent, canActivate: [AuthGuard] },
  { path: 'owner/dashboard', component: OwnerDashboardComponent, canActivate: [OwnerGuard] },
  { path: 'owner/property/new', component: OwnerPropertyFormComponent, canActivate: [OwnerGuard] },
  { path: 'owner/property/:id', component: OwnerPropertyFormComponent, canActivate: [OwnerGuard] },
  { path: '**', redirectTo: '' }
];
