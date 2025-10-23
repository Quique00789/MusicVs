import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Song } from '../models/song';
import { FavoritesService } from '../services/favorites.service';
import { AudioPlayerService } from '../services/audio-player.service';
import { PlaylistsService, Playlist } from '../services/playlists.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen pt-24 pb-32 px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-12">
          <div class="flex items-center gap-4 mb-4">
            <div class="neo-card p-4 rounded-2xl">
              <svg class="w-12 h-12 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-5xl font-bold gradient-text">Favoritas</h1>
              <p class="text-xl text-gray-400 mt-2">{{ favorites.length }} canción{{ favorites.length !== 1 ? 'es' : '' }}</p>
            </div>
          </div>
          <p class="text-lg text-gray-400 max-w-2xl">
            Tu colección personal de música favorita. Todas las canciones que amas en un solo lugar.
          </p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" *ngIf="favorites.length > 0">
          <div class="glass-card p-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-2xl font-bold text-white">{{ favorites.length }}</h3>
                <p class="text-gray-400">Canciones</p>
              </div>
              <div class="neo-card p-3 rounded-xl">
                <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="glass-card p-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-2xl font-bold text-white">{{ uniqueArtists.length }}</h3>
                <p class="text-gray-400">Artistas</p>
              </div>
              <div class="neo-card p-3 rounded-xl">
                <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="glass-card p-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-2xl font-bold text-white">{{ totalDuration }}</h3>
                <p class="text-gray-400">Duración total</p>
              </div>
              <div class="neo-card p-3 rounded-xl">
                <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions Bar -->
        <div class="glass-card p-4 mb-8" *ngIf="favorites.length > 0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button 
                (click)="playAllFavorites()"
                class="neo-btn-primary px-6 py-3 rounded-xl font-medium flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Reproducir Todo
              </button>
              
              <button 
                (click)="shuffleFavorites()"
                class="glass-btn px-6 py-3 rounded-xl font-medium flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                </svg>
                Aleatorio
              </button>
            </div>
            
            <div class="flex items-center gap-2">
              <button 
                (click)="clearAllFavorites()"
                class="glass-btn px-4 py-2 rounded-lg text-red-400 hover:text-red-300 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Favorites Grid -->
        <div *ngIf="favorites.length > 0; else emptyState">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <div *ngFor="let song of favorites; trackBy: trackBySongId" 
                 class="neo-card p-4 group cursor-pointer hover:scale-[1.02] transition-all duration-300"
                 (click)="playSong(song)">
              <div class="relative mb-3">
                <img [src]="song.cover || getDefaultCover()" 
                     [alt]="song.title" 
                     class="w-full h-32 object-cover rounded-lg">
                <div class="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <button class="glass-btn p-3 rounded-full">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
                
                <!-- Remove from Favorites -->
                <button 
                  (click)="removeFavorite(song, $event)"
                  class="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
                
                <!-- Add to Playlist -->
                <button 
                  (click)="openPlaylistMenu(song, $event)"
                  class="absolute top-2 left-2 p-1.5 glass-btn rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </button>
              </div>
              
              <h4 class="font-semibold text-sm text-white mb-1 truncate">{{ song.title }}</h4>
              <p class="text-gray-400 text-xs truncate">{{ song.artist }}</p>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-gray-500">{{ song.duration }}</span>
                <span class="text-xs text-gray-500">{{ song.album }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <ng-template #emptyState>
          <div class="text-center py-16">
            <div class="glass-panel p-12 max-w-lg mx-auto">
              <div class="neo-card p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-white mb-4">No tienes favoritas aún</h3>
              <p class="text-gray-400 mb-8 leading-relaxed">
                Explora nuestra biblioteca musical y marca como favoritas las canciones que más te gusten. 
                Apareceán aquí para que puedas acceder rápidamente a ellas.
              </p>
              <button 
                (click)="goToDiscover()"
                class="neo-btn-primary px-8 py-4 rounded-xl font-medium">
                Explorar Música
              </button>
            </div>
          </div>
        </ng-template>

        <!-- Playlist Menu Modal -->
        <div *ngIf="showPlaylistMenu" 
             class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             (click)="closePlaylistMenu()">
          <div class="glass-panel p-6 max-w-md w-full" (click)="$event.stopPropagation()">
            <h3 class="text-xl font-bold mb-4 text-white">Agregar a Playlist</h3>
            <div class="space-y-3 max-h-60 overflow-y-auto scrollbar-hide">
              <button *ngFor="let playlist of playlists"
                      (click)="addToPlaylist(playlist.id)"
                      class="w-full text-left p-3 neo-btn rounded-lg hover:bg-white/5 transition-all duration-300">
                <div class="font-medium text-white">{{ playlist.name }}</div>
                <div class="text-sm text-gray-400">{{ playlist.tracks.length }} canciones</div>
              </button>
            </div>
            <div class="mt-4 pt-4 border-t border-white/10">
              <button (click)="createAndAddToPlaylist()" class="w-full neo-btn-primary p-3 rounded-lg font-medium">
                Crear Nueva Playlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FavoritesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  favorites: Song[] = [];
  uniqueArtists: string[] = [];
  totalDuration = '0:00';
  
  showPlaylistMenu = false;
  selectedSong: Song | null = null;
  playlists: Playlist[] = [];

  constructor(
    private router: Router,
    private favoritesService: FavoritesService,
    private audioPlayerService: AudioPlayerService,
    private playlistsService: PlaylistsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions() {
    // Subscribe to favorites
    this.favoritesService.favorites$
      .pipe(takeUntil(this.destroy$))
      .subscribe(favorites => {
        this.favorites = favorites;
        this.calculateStats();
        this.cdr.detectChanges();
      });

    // Subscribe to playlists
    this.playlistsService.playlists$
      .pipe(takeUntil(this.destroy$))
      .subscribe(playlists => {
        this.playlists = playlists;
        this.cdr.detectChanges();
      });
  }

  private calculateStats() {
    // Calculate unique artists
    const artistsSet = new Set(this.favorites.map(song => song.artist));
    this.uniqueArtists = Array.from(artistsSet);
    
    // Calculate total duration (simplified)
    // In a real app, you'd parse the duration strings properly
    const totalMinutes = this.favorites.length * 3.5; // Assume average 3.5 minutes per song
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    
    if (hours > 0) {
      this.totalDuration = `${hours}h ${minutes}m`;
    } else {
      this.totalDuration = `${minutes}m`;
    }
  }

  trackBySongId(index: number, song: Song): string {
    return song.id;
  }

  async playSong(song: Song) {
    try {
      await this.audioPlayerService.playSong(song, song.audioPath, song.requiresSignedUrl || false);
      // Set the current index based on favorites array
      const index = this.favorites.findIndex(s => s.id === song.id);
      if (index >= 0) {
        this.audioPlayerService.currentIndex.set(index);
      }
    } catch (error) {
      console.error('Error playing song:', error);
    }
  }

  async playAllFavorites() {
    if (this.favorites.length > 0) {
      await this.playSong(this.favorites[0]);
    }
  }

  async shuffleFavorites() {
    if (this.favorites.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.favorites.length);
      await this.playSong(this.favorites[randomIndex]);
    }
  }

  removeFavorite(song: Song, event: Event) {
    event.stopPropagation();
    this.favoritesService.toggle(song);
  }

  clearAllFavorites() {
    if (confirm('¿Estás seguro de que deseas eliminar todas las canciones favoritas?')) {
      this.favoritesService.clearFavorites();
    }
  }

  openPlaylistMenu(song: Song, event: Event) {
    event.stopPropagation();
    this.selectedSong = song;
    this.showPlaylistMenu = true;
  }

  closePlaylistMenu() {
    this.showPlaylistMenu = false;
    this.selectedSong = null;
  }

  addToPlaylist(playlistId: string) {
    if (this.selectedSong) {
      this.playlistsService.addSongToPlaylist(playlistId, this.selectedSong);
      this.closePlaylistMenu();
    }
  }

  createAndAddToPlaylist() {
    if (this.selectedSong) {
      const playlistName = prompt('Nombre de la nueva playlist:');
      if (playlistName?.trim()) {
        const newPlaylist = this.playlistsService.createPlaylist(playlistName.trim());
        this.playlistsService.addSongToPlaylist(newPlaylist.id, this.selectedSong);
        this.closePlaylistMenu();
      }
    }
  }

  goToDiscover() {
    this.router.navigate(['/discover']);
  }

  getDefaultCover(): string {
    return 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg';
  }
}