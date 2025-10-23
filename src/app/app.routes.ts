import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { HomeComponent } from './home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', loadComponent: () => AuthComponent },
  { path: '**', redirectTo: '' }
];