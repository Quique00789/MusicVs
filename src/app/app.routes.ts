import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { HomeComponent } from './home.component';
import { DiscoverComponent } from './discover.component';
import { PlaylistsComponent } from './playlists.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },  // Ruta raíz
  { path: 'auth', loadComponent: () => AuthComponent },
  { path: 'discover', component: DiscoverComponent },  // Ruta Discover
  { path: 'playlists', component: PlaylistsComponent },  // Nueva ruta Playlists
  { path: '**', redirectTo: '' }  // Redirección para rutas no encontradas
];