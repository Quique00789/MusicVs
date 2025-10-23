import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { HomeComponent } from './home.component';
import { DiscoverComponent } from './discover.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },  // Ruta raíz
  { path: 'auth', loadComponent: () => AuthComponent },
  { path: 'discover', component: DiscoverComponent },  // Nueva ruta Discover
  { path: '**', redirectTo: '' }  // Redirección para rutas no encontradas
];