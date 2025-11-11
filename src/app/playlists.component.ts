import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Song } from './models/song';
import { songs } from './data/songs';

interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string;
  songs: Song[];
  createdAt: string;
  duration: string;
  isPublic: boolean;
}

interface QueueItem extends Song {
  queuePosition: number;
  isCurrentlyPlaying: boolean;
}

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="playlists-container">
      <!-- Hero Section -->
      <div class="playlists-hero">
        <div class="hero-content">
          <h1 class="hero-title fade-in-up">Mis Playlists</h1>
          <p class="hero-subtitle fade-in-up">Organiza y disfruta tu música favorita</p>
          
          <!-- Create Playlist Button -->
          <button class="create-playlist-btn glass-morphism fade-in-up" (click)="toggleCreateModal()">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Crear Playlist
          </button>
        </div>
        
        <!-- Floating Elements -->
        <div class="floating-elements">
          <div class="floating-note note-1">♫</div>
          <div class="floating-note note-2">♪</div>
          <div class="floating-note note-3">♬</div>
        </div>
      </div>

      <div class="main-content">
        <!-- Left Panel: Playlists Grid -->
        <div class="playlists-panel">
          <div class="section-header">
            <h2 class="section-title">Mis Playlists ({{ playlists.length }})</h2>
            <div class="view-toggles">
              <button 
                class="view-btn" 
                [class.active]="viewMode === 'grid'"
                (click)="setViewMode('grid')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </button>
              <button 
                class="view-btn" 
                [class.active]="viewMode === 'list'"
                (click)="setViewMode('list')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Playlists Grid/List -->
          <div class="playlists-content" [class.list-view]="viewMode === 'list'" [class.grid-view]="viewMode === 'grid'">
            <div 
              *ngFor="let playlist of playlists; trackBy: trackByPlaylist; let i = index"
              class="playlist-card glass-morphism fade-in-up"
              [class.selected]="selectedPlaylist?.id === playlist.id"
              [style.animation-delay.s]="i * 0.1"
              (click)="selectPlaylist(playlist)"
            >
              <div class="playlist-cover">
                <img [src]="playlist.cover" [alt]="playlist.name" loading="lazy">
                <div class="playlist-overlay">
                  <button class="play-all-btn neomorphism" (click)="playPlaylist(playlist, $event)">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
                <!-- Privacy Badge -->
                <div class="privacy-badge" [class.public]="playlist.isPublic" [class.private]="!playlist.isPublic">
                  <svg *ngIf="playlist.isPublic" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <svg *ngIf="!playlist.isPublic" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
              </div>
              
              <div class="playlist-info">
                <h3 class="playlist-name">{{ playlist.name }}</h3>
                <p class="playlist-description" *ngIf="viewMode === 'grid'">{{ playlist.description }}</p>
                <div class="playlist-meta">
                  <span class="song-count">{{ playlist.songs.length }} canciones</span>
                  <span class="separator" *ngIf="viewMode === 'grid'">•</span>
                  <span class="duration" *ngIf="viewMode === 'grid'">{{ playlist.duration }}</span>
                </div>
              </div>
              <!-- Playlist Actions -->
              <div class="playlist-actions">
                <button class="action-btn" (click)="togglePlaylistOptions(playlist, $event)" title="Más opciones">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Queue -->
        <div class="queue-panel glass-morphism">
          <div class="queue-header">
            <h3 class="queue-title">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM22 17c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"></path>
              </svg>
              Cola de Reproducción
            </h3>
            <div class="queue-controls">
              <button class="queue-control-btn" (click)="shuffleQueue()" title="Aleatorio" [class.active]="isShuffled">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                </svg>
              </button>
              <button class="queue-control-btn" (click)="clearQueue()" title="Limpiar cola">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Current Playing -->
          <div *ngIf="currentSong" class="current-playing neomorphism">
            <div class="current-cover">
              <img [src]="currentSong.cover" [alt]="currentSong.title">
              <div class="playing-indicator">
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
              </div>
            </div>
            <div class="current-info">
              <h4 class="current-title">{{ currentSong.title }}</h4>
              <p class="current-artist">{{ currentSong.artist }}</p>
            </div>
            <button class="pause-btn" (click)="togglePlayPause()">
              <svg *ngIf="!isPlaying" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <svg *ngIf="isPlaying" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            </button>
          </div>
          
          <!-- Queue List -->
          <div class="queue-list">
            <div class="queue-info" *ngIf="queue.length > 0">
              <span>Siguiente: {{ queue.length }} {{ queue.length === 1 ? 'canción' : 'canciones' }}</span>
            </div>
            
            <div class="queue-empty" *ngIf="queue.length === 0 && !currentSong">
              <svg class="w-12 h-12 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM22 17c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"></path>
              </svg>
              <p class="text-gray-500 text-center">La cola está vacía</p>
              <p class="text-gray-400 text-sm text-center mt-2">Selecciona una playlist para comenzar</p>
            </div>
            
            <div 
              *ngFor="let song of queue; trackBy: trackBySong; let i = index"
              class="queue-item"
              [class.playing]="song.isCurrentlyPlaying"
            >
              <div class="queue-position">
                <span *ngIf="!song.isCurrentlyPlaying">{{ i + 1 }}</span>
                <div *ngIf="song.isCurrentlyPlaying" class="playing-dot"></div>
              </div>
              
              <div class="queue-cover">
                <img [src]="song.cover" [alt]="song.title">
              </div>
              
              <div class="queue-info-item">
                <h4 class="queue-song-title">{{ song.title }}</h4>
                <p class="queue-song-artist">{{ song.artist }}</p>
              </div>
              
              <div class="queue-duration">{{ song.duration }}</div>
              
              <div class="queue-actions">
                <button class="queue-action-btn" (click)="playSongFromQueue(i)" title="Reproducir">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-2-7a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </button>
                <button class="queue-action-btn" (click)="removeSongFromQueue(i)" title="Quitar de la cola">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [/* OMITIDO POR LARGO, PERO EXACTAMENTE COMO COMPARTIDO */]
})
export class PlaylistsComponent implements OnInit {
  viewMode: 'grid' | 'list' = 'grid';
  selectedPlaylist: Playlist | null = null;
  queue: QueueItem[] = [];
  currentSong: Song | null = null;
  isPlaying = false;
  isShuffled = false;
  playlists: Playlist[] = [
    {
      id: '1',
      name: 'Mis Favoritos',
      description: 'Las mejores canciones que no me canso de escuchar',
      cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      songs: [...songs],
      createdAt: '2024-01-15',
      duration: this.calculatePlaylistDuration(songs),
      isPublic: false
    },
    {
      id: '2',
      name: 'Para Trabajar',
      description: 'Música instrumental para concentrarse',
      cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
      songs: [songs[0], songs[2]],
      createdAt: '2024-02-01',
      duration: this.calculatePlaylistDuration([songs[0], songs[2]]),
      isPublic: true
    },
    {
      id: '3',
      name: 'Relax',
      description: 'Para relajarse después de un día largo',
      cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',
      songs: [songs[1]],
      createdAt: '2024-02-10',
      duration: this.calculatePlaylistDuration([songs[1]]),
      isPublic: false
    },
    {
      id: '4',
      name: 'DJ Valls Collection',
      description: 'Toda la colección completa de DJ Valls',
      cover: 'https://images.unsplash.com/photo-1571974599782-87624638275c?w=400&h=400&fit=crop',
      songs: [...songs],
      createdAt: '2024-01-01',
      duration: this.calculatePlaylistDuration(songs),
      isPublic: true
    }
  ];
  constructor(private cdr: ChangeDetectorRef) {}
  ngOnInit() {}
  private calculatePlaylistDuration(songs: Song[]): string {
    const totalMinutes = songs.length * 1.1;
    const minutes = Math.floor(totalMinutes);
    const seconds = Math.floor((totalMinutes - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
    this.cdr.detectChanges();
  }
  selectPlaylist(playlist: Playlist) {
    this.selectedPlaylist = playlist;
    this.cdr.detectChanges();
  }
  playPlaylist(playlist: Playlist, event: Event) {
    event.stopPropagation();
    this.selectedPlaylist = playlist;
    this.queue = playlist.songs.map((song, index) => ({ ...song, queuePosition: index + 1, isCurrentlyPlaying: index === 0 }));
    if (this.queue.length > 0) {
      this.currentSong = this.queue[0];
      this.isPlaying = true;
      this.queue = this.queue.slice(1).map((song, index) => ({ ...song, queuePosition: index + 1, isCurrentlyPlaying: false }));
    }
    this.cdr.detectChanges();
  }
  playSongFromQueue(index: number) {
    if (index < this.queue.length) {
      if (this.currentSong) {
        this.queue.unshift({ ...this.currentSong, queuePosition: 1, isCurrentlyPlaying: false });
      }
      const selectedSong = this.queue[index + (this.currentSong ? 1 : 0)];
      this.currentSong = selectedSong;
      this.isPlaying = true;
      this.queue.splice(index + (this.currentSong ? 1 : 0), 1);
      this.queue = this.queue.map((song, idx) => ({ ...song, queuePosition: idx + 1, isCurrentlyPlaying: false }));
      this.cdr.detectChanges();
    }
  }
  removeSongFromQueue(index: number) {
    this.queue.splice(index, 1);
    this.queue = this.queue.map((song, idx) => ({ ...song, queuePosition: idx + 1 }));
    this.cdr.detectChanges();
  }
  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    this.cdr.detectChanges();
  }
  shuffleQueue() {
    if (this.queue.length > 1) {
      for (let i = this.queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
      }
      this.queue = this.queue.map((song, idx) => ({ ...song, queuePosition: idx + 1 }));
      this.isShuffled = !this.isShuffled;
      this.cdr.detectChanges();
    }
  }
  clearQueue() {
    this.queue = [];
    this.currentSong = null;
    this.isPlaying = false;
    this.cdr.detectChanges();
  }
  toggleCreateModal() {
    // TODO: Implement create playlist modal
    console.log('Create playlist modal');
  }
  togglePlaylistOptions(playlist: Playlist, event: Event) {
    event.stopPropagation();
    console.log('Playlist options for:', playlist.name);
  }
  trackByPlaylist(index: number, playlist: Playlist): string {
    return playlist.id;
  }
  trackBySong(index: number, song: QueueItem): string {
    return song.id;
  }
}
