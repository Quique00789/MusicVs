import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { AuthCallbackComponent } from './auth-callback.component';
import { HomeComponent } from './home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },  // Ruta raíz
  { path: 'auth', loadComponent: () => AuthComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: '**', redirectTo: '' }  // Redirección para rutas no encontradas
];