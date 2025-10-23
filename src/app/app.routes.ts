import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { HomeComponent } from './home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', loadComponent: () => AuthComponent },
  { 
    path: 'discover', 
    loadComponent: () => import('./pages/discover.component.ts').then(m => m.DiscoverComponent)
  },
  { 
    path: 'playlists', 
    loadComponent: () => import('./pages/playlists.component.ts').then(m => m.PlaylistsComponent)
  },
  { 
    path: 'playlist/:id', 
    loadComponent: () => import('./pages/playlist-detail.component.ts').then(m => m.PlaylistDetailComponent)
  },
  { 
    path: 'artists', 
    loadComponent: () => import('./pages/artists.component.ts').then(m => m.ArtistsComponent)
  },
  { 
    path: 'artist/:id', 
    loadComponent: () => import('./pages/artist-detail.component.ts').then(m => m.ArtistDetailComponent)
  },
  { 
    path: 'favorites', 
    loadComponent: () => import('./pages/favorites.component.ts').then(m => m.FavoritesComponent)
  },
  { path: '**', redirectTo: '' }
];