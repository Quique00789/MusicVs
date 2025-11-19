import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { HomeComponent } from './home.component';
import { DiscoverComponent } from './discover.component';
import { PlaylistsComponent } from './playlists.component';
import { PlaylistDetailComponent } from './playlist-detail.component';
import { ArtistsComponent } from './artists.component';
import { ArtistDetailComponent } from './artist-detail.component';
import { FavoritesPageComponent } from './favorites.page';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', loadComponent: () => AuthComponent },
  { path: 'discover', component: DiscoverComponent },
  { path: 'playlists', component: PlaylistsComponent },
  { path: 'playlist/:id', component: PlaylistDetailComponent },
  { path: 'favorites', component: FavoritesPageComponent },
  { path: 'artists', component: ArtistsComponent },
  { path: 'artist/:id', component: ArtistDetailComponent },
  { path: '**', redirectTo: '' }
];