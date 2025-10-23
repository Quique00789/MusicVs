import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { songs } from '../data/songs';
import { Song } from '../models/song';
import { FavoritesService } from '../services/favorites.service';
import { PlaylistsService, Playlist } from '../services/playlists.service';
import { ArtistsService } from '../services/artists.service';
import { AudioPlayerService } from '../services/audio-player.service';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen pt-24 pb-32 px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-12">
          <h1 class="text-5xl font-bold mb-4 gradient-text">Discover</h1>
          <p class="text-xl text-gray-400 max-w-2xl">
            Explora nueva música curada especialmente para ti. Descubre géneros, artistas y canciones que se adapten a tu estado de ánimo.
          </p>
        </div>

        <!-- Filters -->
        <div class="glass-card p-6 mb-8">
          <div class="flex flex-wrap gap-4 items-center justify-between">
            <!-- Search -->
            <div class="flex-1 min-w-[300px]">
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (input)="onSearchChange()"
                  placeholder="Buscar música..."
                  class="w-full pl-12 pr-4 py-3 neo-input text-white placeholder-gray-400 focus:outline-none"
                >
                <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>

            <!-- Genre Filter -->
            <div class="flex gap-2 flex-wrap">
              <button
                *ngFor="let genre of genres"
                (click)="toggleGenre(genre)"
                [class]="getGenreButtonClass(genre)"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300">
                {{ genre }}
              </button>
            </div>
          </div>
        </div>

        <!-- Featured Section -->
        <div class="mb-12">
          <h2 class="text-3xl font-bold mb-6 text-white">Destacados</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let song of featuredSongs" class="glass-card p-6 group cursor-pointer hover:scale-[1.02] transition-all duration-300"
                 (click)="playSong(song)">
              <div class="relative mb-4">
                <img [src]="song.cover || getDefaultCover()" 
                     [alt]="song.title" 
                     class="w-full h-48 object-cover rounded-xl">
                <div class="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <button class="neo-btn-primary p-4 rounded-full">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
                <!-- Favorite Button -->
                <button 
                  (click)="toggleFavorite(song, $event)"
                  [class]="getFavoriteButtonClass(song.id)"
                  class="absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>
              <h3 class="font-bold text-lg text-white mb-1 truncate">{{ song.title }}</h3>
              <p class="text-gray-400 text-sm truncate">{{ song.artist }}</p>
              <div class="flex items-center justify-between mt-4">
                <span class="text-xs text-gray-500">{{ song.duration }}</span>
                <button 
                  (click)="openPlaylistMenu(song, $event)"
                  class="glass-btn p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- All Songs -->
        <div>
          <h2 class="text-3xl font-bold mb-6 text-white">Toda la Música</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <div *ngFor="let song of filteredSongs" class="neo-card p-4 group cursor-pointer hover:scale-[1.02] transition-all duration-300"
                 (click)="playSong(song)">
              <div class="relative mb-3">
                <img [src]="song.cover || getDefaultCover()" 
                     [alt]="song.title" 
                     class="w-full h-32 object-cover rounded-lg">
                <div class="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <button class="glass-btn p-3 rounded-full">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
                <!-- Favorite Button -->
                <button 
                  (click)="toggleFavorite(song, $event)"
                  [class]="getFavoriteButtonClass(song.id)"
                  class="absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all duration-300">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>
              <h4 class="font-semibold text-sm text-white mb-1 truncate">{{ song.title }}</h4>
              <p class="text-gray-400 text-xs truncate">{{ song.artist }}</p>
            </div>
          </div>
        </div>

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
export class DiscoverComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  searchQuery = '';
  selectedGenres: string[] = [];
  genres = ['Todos', 'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Indie', 'Latin', 'Jazz'];
  
  allSongs = songs;
  featuredSongs: Song[] = [];
  filteredSongs: Song[] = [];
  
  showPlaylistMenu = false;
  selectedSong: Song | null = null;
  playlists: Playlist[] = [];
  favorites: Song[] = [];

  constructor(
    private router: Router,
    private favoritesService: FavoritesService,
    private playlistsService: PlaylistsService,
    private artistsService: ArtistsService,
    private audioPlayerService: AudioPlayerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
    this.setupSubscriptions();
    this.filterSongs();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData() {
    // Set featured songs (first 6)
    this.featuredSongs = this.allSongs.slice(0, 6);
    
    // Initialize filtered songs
    this.filteredSongs = [...this.allSongs];
  }

  private setupSubscriptions() {
    // Subscribe to favorites
    this.favoritesService.favorites$
      .pipe(takeUntil(this.destroy$))
      .subscribe(favorites => {
        this.favorites = favorites;
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

  onSearchChange() {
    this.filterSongs();
  }

  toggleGenre(genre: string) {
    if (genre === 'Todos') {
      this.selectedGenres = [];
    } else {
      const index = this.selectedGenres.indexOf(genre);
      if (index >= 0) {
        this.selectedGenres.splice(index, 1);
      } else {
        this.selectedGenres.push(genre);
      }
    }
    this.filterSongs();
  }

  private filterSongs() {
    let filtered = [...this.allSongs];

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.album?.toLowerCase().includes(query)
      );
    }

    // Filter by genres (simplified - using mock logic)
    if (this.selectedGenres.length > 0) {
      // Since our songs don't have genres, we'll use a simple mock filter
      // In a real app, you'd filter by actual genre properties
    }

    this.filteredSongs = filtered;
  }

  getGenreButtonClass(genre: string): string {
    const isSelected = genre === 'Todos' ? this.selectedGenres.length === 0 : this.selectedGenres.includes(genre);
    return isSelected 
      ? 'neo-btn-primary text-white' 
      : 'glass-btn text-gray-300 hover:text-white';
  }

  getFavoriteButtonClass(songId: string): string {
    const isFavorite = this.favoritesService.isFavorite(songId);
    return isFavorite 
      ? 'bg-red-500/80 text-white' 
      : 'bg-black/40 text-gray-300 hover:text-red-400';
  }

  toggleFavorite(song: Song, event: Event) {
    event.stopPropagation();
    this.favoritesService.toggle(song);
  }

  async playSong(song: Song) {
    try {
      await this.audioPlayerService.playSong(song, song.audioPath, song.requiresSignedUrl || false);
      const index = this.allSongs.findIndex(s => s.id === song.id);
      if (index >= 0) {
        this.audioPlayerService.currentIndex.set(index);
      }
    } catch (error) {
      console.error('Error playing song:', error);
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

  getDefaultCover(): string {
    return 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg';
  }
}