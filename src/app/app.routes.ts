import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { HomeComponent } from './home.component';
import { DiscoverComponent } from './discover.component';
import { PlaylistsComponent } from './playlists.component';
import { ArtistsComponent } from './artists.component';
import { ArtistDetailComponent } from './artist-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },  // Ruta raíz
  { path: 'auth', loadComponent: () => AuthComponent },
  { path: 'discover', component: DiscoverComponent },  // Ruta Discover
  { path: 'playlists', component: PlaylistsComponent },  // Nueva ruta Playlists
  { path: 'artists', component: ArtistsComponent },  // Nueva ruta para artistas
  { path: 'artist/:id', component: ArtistDetailComponent },  // Nueva ruta para detalle de artista
  { path: '**', redirectTo: '' }  // Redirección para rutas no encontradas
];