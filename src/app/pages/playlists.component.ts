import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PlaylistsService, Playlist } from '../services/playlists.service';
import { FavoritesService } from '../services/favorites.service';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen pt-24 pb-32 px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-12">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
              <div class="neo-card p-4 rounded-2xl">
                <svg class="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"></path>
                </svg>
              </div>
              <div>
                <h1 class="text-5xl font-bold gradient-text">Playlists</h1>
                <p class="text-xl text-gray-400 mt-2">{{ playlists.length }} playlist{{ playlists.length !== 1 ? 's' : '' }}</p>
              </div>
            </div>
            
            <button 
              (click)="openCreateModal()"
              class="neo-btn-primary px-6 py-3 rounded-xl font-medium flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Crear Playlist
            </button>
          </div>
          
          <p class="text-lg text-gray-400 max-w-2xl">
            Organiza tu música en colecciones personalizadas. Crea playlists para cada momento y estado de ánimo.
          </p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" *ngIf="playlists.length > 0">
          <div class="glass-card p-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-2xl font-bold text-white">{{ playlists.length }}</h3>
                <p class="text-gray-400">Playlists</p>
              </div>
              <div class="neo-card p-3 rounded-xl">
                <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="glass-card p-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-2xl font-bold text-white">{{ totalTracks }}</h3>
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
                <h3 class="text-2xl font-bold text-white">{{ favoriteCount }}</h3>
                <p class="text-gray-400">Favoritas</p>
              </div>
              <div class="neo-card p-3 rounded-xl">
                <svg class="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="glass-card p-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-2xl font-bold text-white">{{ totalDuration }}</h3>
                <p class="text-gray-400">Duración</p>
              </div>
              <div class="neo-card p-3 rounded-xl">
                <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Playlists Grid -->
        <div *ngIf="playlists.length > 0; else emptyState">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div *ngFor="let playlist of playlists; trackBy: trackByPlaylistId" 
                 class="glass-card p-6 group cursor-pointer hover:scale-[1.02] transition-all duration-300"
                 (click)="openPlaylist(playlist)">
              
              <!-- Playlist Cover -->
              <div class="relative mb-4">
                <div class="w-full h-40 rounded-xl overflow-hidden bg-gradient-to-br from-purple-600/20 to-cyan-600/20 flex items-center justify-center">
                  <div *ngIf="playlist.tracks.length > 0; else emptyPlaylistCover" class="grid grid-cols-2 gap-1 w-full h-full">
                    <img *ngFor="let track of getPlaylistCoverTracks(playlist); let i = index" 
                         [src]="track.cover || getDefaultCover()" 
                         [alt]="track.title"
                         class="w-full h-full object-cover" 
                         [class.rounded-tl-xl]="i === 0"
                         [class.rounded-tr-xl]="i === 1"
                         [class.rounded-bl-xl]="i === 2"
                         [class.rounded-br-xl]="i === 3">
                  </div>
                  
                  <ng-template #emptyPlaylistCover>
                    <div class="neo-card p-6 rounded-2xl">
                      <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"></path>
                      </svg>
                    </div>
                  </ng-template>
                </div>
                
                <!-- Play Button Overlay -->
                <div class="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <button class="neo-btn-primary p-4 rounded-full">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
                
                <!-- Actions Menu -->
                <button 
                  (click)="openPlaylistMenu(playlist, $event)"
                  class="absolute top-3 right-3 p-2 glass-btn rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                  </svg>
                </button>
              </div>
              
              <!-- Playlist Info -->
              <h3 class="font-bold text-lg text-white mb-2 truncate">{{ playlist.name }}</h3>
              <p class="text-gray-400 text-sm mb-3 line-clamp-2">{{ playlist.description || 'Sin descripción' }}</p>
              
              <div class="flex items-center justify-between text-xs text-gray-500">
                <span>{{ playlist.tracks.length }} canción{{ playlist.tracks.length !== 1 ? 'es' : '' }}</span>
                <span>{{ formatDate(playlist.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <ng-template #emptyState>
          <div class="text-center py-16">
            <div class="glass-panel p-12 max-w-lg mx-auto">
              <div class="neo-card p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-white mb-4">Crea tu primera playlist</h3>
              <p class="text-gray-400 mb-8 leading-relaxed">
                Organiza tu música favorita en playlists personalizadas. Perfectas para entrenar, relajarse, trabajar o cualquier momento especial.
              </p>
              <button 
                (click)="openCreateModal()"
                class="neo-btn-primary px-8 py-4 rounded-xl font-medium">
                Crear Playlist
              </button>
            </div>
          </div>
        </ng-template>

        <!-- Create Playlist Modal -->
        <div *ngIf="showCreateModal" 
             class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             (click)="closeCreateModal()">
          <div class="glass-panel p-8 max-w-md w-full" (click)="$event.stopPropagation()">
            <h2 class="text-2xl font-bold text-white mb-6">Crear Nueva Playlist</h2>
            <form (ngSubmit)="createPlaylist()" #createForm="ngForm">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                <input 
                  type="text" 
                  [(ngModel)]="newPlaylistName"
                  name="name"
                  required
                  maxlength="50"
                  class="w-full p-3 neo-input text-white placeholder-gray-400 focus:outline-none"
                  placeholder="Mi Playlist Increíble"
                  #nameInput>
              </div>
              
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-300 mb-2">Descripción (opcional)</label>
                <textarea 
                  [(ngModel)]="newPlaylistDescription"
                  name="description"
                  rows="3"
                  maxlength="200"
                  class="w-full p-3 neo-input text-white placeholder-gray-400 resize-none focus:outline-none"
                  placeholder="Describe tu playlist..."></textarea>
              </div>
              
              <div class="flex gap-3">
                <button 
                  type="button"
                  (click)="closeCreateModal()"
                  class="flex-1 py-3 glass-btn rounded-xl font-medium">
                  Cancelar
                </button>
                <button 
                  type="submit"
                  [disabled]="!createForm.form.valid"
                  class="flex-1 py-3 neo-btn-primary rounded-xl font-medium disabled:opacity-50">
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Playlist Action Menu -->
        <div *ngIf="showPlaylistActionMenu" 
             class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             (click)="closePlaylistActionMenu()">
          <div class="glass-panel p-6 max-w-sm w-full" (click)="$event.stopPropagation()">
            <h3 class="text-xl font-bold mb-4 text-white">{{ selectedPlaylist?.name }}</h3>
            <div class="space-y-2">
              <button 
                (click)="editPlaylist()"
                class="w-full text-left p-3 glass-btn rounded-lg hover:bg-white/5 transition-all duration-300 flex items-center gap-3">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                <span class="text-white">Editar</span>
              </button>
              
              <button 
                (click)="deletePlaylist()"
                class="w-full text-left p-3 glass-btn rounded-lg hover:bg-white/5 transition-all duration-300 flex items-center gap-3 text-red-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PlaylistsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  playlists: Playlist[] = [];
  totalTracks = 0;
  favoriteCount = 0;
  totalDuration = '0h 0m';
  
  showCreateModal = false;
  newPlaylistName = '';
  newPlaylistDescription = '';
  
  showPlaylistActionMenu = false;
  selectedPlaylist: Playlist | null = null;

  constructor(
    private router: Router,
    private playlistsService: PlaylistsService,
    private favoritesService: FavoritesService,
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
    // Subscribe to playlists
    this.playlistsService.playlists$
      .pipe(takeUntil(this.destroy$))
      .subscribe(playlists => {
        this.playlists = playlists;
        this.calculateStats();
        this.cdr.detectChanges();
      });

    // Subscribe to favorites
    this.favoritesService.favorites$
      .pipe(takeUntil(this.destroy$))
      .subscribe(favorites => {
        this.favoriteCount = favorites.length;
        this.cdr.detectChanges();
      });
  }

  private calculateStats() {
    this.totalTracks = this.playlists.reduce((total, playlist) => total + playlist.tracks.length, 0);
    
    // Calculate total duration (simplified)
    const totalMinutes = this.totalTracks * 3.5; // Assume average 3.5 minutes per song
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    
    this.totalDuration = `${hours}h ${minutes}m`;
  }

  trackByPlaylistId(index: number, playlist: Playlist): string {
    return playlist.id;
  }

  getPlaylistCoverTracks(playlist: Playlist) {
    return playlist.tracks.slice(0, 4);
  }

  formatDate(date: Date): string {
    return new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newPlaylistName = '';
    this.newPlaylistDescription = '';
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  createPlaylist() {
    if (this.newPlaylistName.trim()) {
      this.playlistsService.createPlaylist(
        this.newPlaylistName.trim(),
        this.newPlaylistDescription.trim() || undefined
      );
      this.closeCreateModal();
    }
  }

  openPlaylist(playlist: Playlist) {
    this.router.navigate(['/playlist', playlist.id]);
  }

  openPlaylistMenu(playlist: Playlist, event: Event) {
    event.stopPropagation();
    this.selectedPlaylist = playlist;
    this.showPlaylistActionMenu = true;
  }

  closePlaylistActionMenu() {
    this.showPlaylistActionMenu = false;
    this.selectedPlaylist = null;
  }

  editPlaylist() {
    if (this.selectedPlaylist) {
      const newName = prompt('Nuevo nombre:', this.selectedPlaylist.name);
      if (newName?.trim() && newName.trim() !== this.selectedPlaylist.name) {
        this.playlistsService.updatePlaylist(this.selectedPlaylist.id, {
          name: newName.trim()
        });
      }
    }
    this.closePlaylistActionMenu();
  }

  deletePlaylist() {
    if (this.selectedPlaylist && confirm(`¿Estás seguro de eliminar "${this.selectedPlaylist.name}"?`)) {
      this.playlistsService.deletePlaylist(this.selectedPlaylist.id);
    }
    this.closePlaylistActionMenu();
  }

  getDefaultCover(): string {
    return 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg';
  }
}