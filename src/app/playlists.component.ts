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
  styles: [`
    .playlists-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
      color: #e6eefc;
    }

    /* Hero Section */
    .playlists-hero {
      height: 40vh;
      min-height: 300px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, 
        rgba(139, 92, 246, 0.1) 0%, 
        rgba(59, 130, 246, 0.08) 50%, 
        rgba(6, 182, 212, 0.1) 100%
      );
      overflow: hidden;
    }

    .hero-content {
      text-align: center;
      z-index: 2;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1rem;
    }

    .hero-subtitle {
      font-size: 1.2rem;
      color: rgba(230, 238, 252, 0.8);
      margin-bottom: 2rem;
      font-weight: 300;
    }

    .create-playlist-btn {
      display: inline-flex;
      align-items: center;
      padding: 1rem 2rem;
      border-radius: 50px;
      border: none;
      color: #e6eefc;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .create-playlist-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 35px rgba(139, 92, 246, 0.3);
    }

    /* Floating Notes */
    .floating-elements {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .floating-note {
      position: absolute;
      font-size: 2rem;
      color: rgba(139, 92, 246, 0.3);
      animation: float 8s ease-in-out infinite;
    }

    .note-1 {
      top: 20%;
      left: 15%;
      animation-delay: 0s;
    }

    .note-2 {
      top: 60%;
      right: 20%;
      animation-delay: 3s;
    }

    .note-3 {
      bottom: 25%;
      left: 25%;
      animation-delay: 6s;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
        opacity: 0.3;
      }
      50% {
        transform: translateY(-30px) rotate(180deg);
        opacity: 0.6;
      }
    }

    /* Main Content */
    .main-content {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
      padding: 2rem;
      max-width: 1600px;
      margin: 0 auto;
    }

    /* Playlists Panel */
    .playlists-panel {
      min-height: 600px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #e6eefc, #8b5cf6);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .view-toggles {
      display: flex;
      gap: 0.5rem;
    }

    .view-btn {
      padding: 0.5rem;
      border-radius: 8px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(230, 238, 252, 0.7);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .view-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #e6eefc;
    }

    .view-btn.active {
      background: linear-gradient(135deg, #8b5cf6, #3b82f6);
      color: white;
    }

    /* Playlists Content */
    .playlists-content.grid-view {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .playlists-content.list-view {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .playlist-card {
      padding: 1.5rem;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }

    .playlists-content.grid-view .playlist-card {
      display: flex;
      flex-direction: column;
    }

    .playlists-content.list-view .playlist-card {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 1rem;
    }

    .playlist-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(139, 92, 246, 0.25);
    }

    .playlist-card.selected {
      border: 2px solid #8b5cf6;
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
    }

    .playlist-cover {
      position: relative;
      border-radius: 15px;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .playlists-content.grid-view .playlist-cover {
      width: 100%;
      aspect-ratio: 1;
    }

    .playlists-content.list-view .playlist-cover {
      width: 60px;
      height: 60px;
      margin-bottom: 0;
    }

    .playlist-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .playlist-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.3s ease;
    }

    .playlist-card:hover .playlist-overlay {
      opacity: 1;
    }

    .play-all-btn {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: none;
      color: #8b5cf6;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .play-all-btn svg {
      width: 20px;
      height: 20px;
      margin-left: 2px;
    }

    .play-all-btn:hover {
      transform: scale(1.1);
      color: #7c3aed;
    }

    .privacy-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 0.3rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .privacy-badge.public {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }

    .privacy-badge.private {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .playlist-info {
      flex: 1;
    }

    .playlist-name {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #e6eefc;
    }

    .playlist-description {
      color: rgba(230, 238, 252, 0.7);
      font-size: 0.9rem;
      margin-bottom: 1rem;
      line-height: 1.4;
    }

    .playlist-meta {
      display: flex;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: rgba(230, 238, 252, 0.6);
    }

    .playlist-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      padding: 0.5rem;
      border-radius: 8px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(230, 238, 252, 0.7);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #e6eefc;
    }

    /* Queue Panel */
    .queue-panel {
      padding: 1.5rem;
      border-radius: 20px;
      height: fit-content;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .queue-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .queue-title {
      display: flex;
      align-items: center;
      font-size: 1.25rem;
      font-weight: 600;
      color: #e6eefc;
    }

    .queue-controls {
      display: flex;
      gap: 0.5rem;
    }

    .queue-control-btn {
      padding: 0.5rem;
      border-radius: 8px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(230, 238, 252, 0.7);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .queue-control-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #e6eefc;
    }

    .queue-control-btn.active {
      background: #8b5cf6;
      color: white;
    }

    /* Current Playing */
    .current-playing {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 15px;
      margin-bottom: 1.5rem;
    }

    .current-cover {
      width: 60px;
      height: 60px;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
    }

    .current-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .playing-indicator {
      position: absolute;
      inset: 0;
      background: rgba(139, 92, 246, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
    }

    .bar {
      width: 3px;
      height: 20px;
      background: white;
      border-radius: 2px;
      animation: bounce 1.4s ease-in-out infinite both;
    }

    .bar:nth-child(2) {
      animation-delay: 0.16s;
    }

    .bar:nth-child(3) {
      animation-delay: 0.32s;
    }

    @keyframes bounce {
      0%, 80%, 100% {
        transform: scaleY(0.5);
      }
      40% {
        transform: scaleY(1);
      }
    }

    .current-info {
      flex: 1;
    }

    .current-title {
      font-weight: 600;
      color: #e6eefc;
      margin-bottom: 0.25rem;
      font-size: 0.95rem;
    }

    .current-artist {
      color: rgba(230, 238, 252, 0.7);
      font-size: 0.85rem;
    }

    .pause-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #8b5cf6, #3b82f6);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .pause-btn svg {
      width: 16px;
      height: 16px;
    }

    .pause-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 5px 15px rgba(139, 92, 246, 0.4);
    }

    /* Queue List */
    .queue-list {
      flex: 1;
      overflow-y: auto;
    }

    .queue-info {
      font-size: 0.85rem;
      color: rgba(230, 238, 252, 0.6);
      margin-bottom: 1rem;
      padding: 0.5rem;
    }

    .queue-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
    }

    .queue-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0.5rem;
      border-radius: 10px;
      margin-bottom: 0.5rem;
      transition: all 0.3s ease;
    }

    .queue-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .queue-item.playing {
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.3);
    }

    .queue-position {
      width: 20px;
      text-align: center;
      font-size: 0.85rem;
      color: rgba(230, 238, 252, 0.6);
    }

    .playing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #8b5cf6;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(139, 92, 246, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
      }
    }

    .queue-cover {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      overflow: hidden;
    }

    .queue-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .queue-info-item {
      flex: 1;
    }

    .queue-song-title {
      font-size: 0.9rem;
      font-weight: 500;
      color: #e6eefc;
      margin-bottom: 0.2rem;
    }

    .queue-song-artist {
      font-size: 0.8rem;
      color: rgba(230, 238, 252, 0.7);
    }

    .queue-duration {
      font-size: 0.8rem;
      color: rgba(230, 238, 252, 0.6);
      margin-right: 0.5rem;
    }

    .queue-actions {
      display: flex;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .queue-item:hover .queue-actions {
      opacity: 1;
    }

    .queue-action-btn {
      padding: 0.25rem;
      border-radius: 4px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(230, 238, 252, 0.7);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .queue-action-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #e6eefc;
    }

    /* Glasmorphism Effect */
    .glass-morphism {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    /* Neomorphism Effect */
    .neomorphism {
      background: linear-gradient(145deg, #1a1a1a, #0f0f0f);
      box-shadow: 
        5px 5px 10px rgba(0, 0, 0, 0.5),
        -5px -5px 10px rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .main-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .queue-panel {
        max-height: 500px;
      }
    }

    @media (max-width: 768px) {
      .playlists-hero {
        height: 30vh;
        min-height: 250px;
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .main-content {
        padding: 1rem;
      }

      .section-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .playlists-content.grid-view {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      }

      .queue-panel {
        padding: 1rem;
      }
    }

    @media (max-width: 480px) {
      .hero-title {
        font-size: 2rem;
      }

      .create-playlist-btn {
        padding: 0.8rem 1.5rem;
        font-size: 0.9rem;
      }

      .playlists-content.grid-view {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 1rem;
      }

      .playlist-card {
        padding: 1rem;
      }

      .main-content {
        gap: 1.5rem;
      }
    }

    /* Animation Classes */
    .fade-in-up {
      animation: fadeInUp 0.8s ease-out;
      animation-fill-mode: both;
    }

    .fade-in-up:nth-child(1) { animation-delay: 0.1s; }
    .fade-in-up:nth-child(2) { animation-delay: 0.2s; }
    .fade-in-up:nth-child(3) { animation-delay: 0.3s; }
    .fade-in-up:nth-child(4) { animation-delay: 0.4s; }
    .fade-in-up:nth-child(5) { animation-delay: 0.5s; }
    .fade-in-up:nth-child(6) { animation-delay: 0.6s; }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Scrollbar */
    .queue-list::-webkit-scrollbar {
      width: 6px;
    }

    .queue-list::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }

    .queue-list::-webkit-scrollbar-thumb {
      background: rgba(139, 92, 246, 0.5);
      border-radius: 3px;
    }

    .queue-list::-webkit-scrollbar-thumb:hover {
      background: rgba(139, 92, 246, 0.7);
    }
  `]
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
      songs: [songs[0], songs[2]], // Demo y Demo3
      createdAt: '2024-02-01',
      duration: this.calculatePlaylistDuration([songs[0], songs[2]]),
      isPublic: true
    },
    {
      id: '3',
      name: 'Relax',
      description: 'Para relajarse después de un día largo',
      cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',
      songs: [songs[1]], // Demo2
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

  ngOnInit() {
    // Initialize component
  }

  private calculatePlaylistDuration(songs: Song[]): string {
    // Simple duration calculation - in real app, would parse actual durations
    const totalMinutes = songs.length * 1.1; // Average 1.1 minutes per demo song
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
    
    // Clear current queue and add all songs from playlist
    this.queue = playlist.songs.map((song, index) => ({
      ...song,
      queuePosition: index + 1,
      isCurrentlyPlaying: index === 0
    }));
    
    // Set first song as current
    if (this.queue.length > 0) {
      this.currentSong = this.queue[0];
      this.isPlaying = true;
      // Remove first song from queue since it's now playing
      this.queue = this.queue.slice(1).map((song, index) => ({
        ...song,
        queuePosition: index + 1,
        isCurrentlyPlaying: false
      }));
    }
    
    this.cdr.detectChanges();
  }

  playSongFromQueue(index: number) {
    if (index < this.queue.length) {
      // Add current song back to queue if there is one
      if (this.currentSong) {
        this.queue.unshift({
          ...this.currentSong,
          queuePosition: 1,
          isCurrentlyPlaying: false
        });
      }
      
      // Set selected song as current
      const selectedSong = this.queue[index + (this.currentSong ? 1 : 0)];
      this.currentSong = selectedSong;
      this.isPlaying = true;
      
      // Remove selected song from queue and update positions
      this.queue.splice(index + (this.currentSong ? 1 : 0), 1);
      this.queue = this.queue.map((song, idx) => ({
        ...song,
        queuePosition: idx + 1,
        isCurrentlyPlaying: false
      }));
      
      this.cdr.detectChanges();
    }
  }

  removeSongFromQueue(index: number) {
    this.queue.splice(index, 1);
    // Update queue positions
    this.queue = this.queue.map((song, idx) => ({
      ...song,
      queuePosition: idx + 1
    }));
    this.cdr.detectChanges();
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    this.cdr.detectChanges();
  }

  shuffleQueue() {
    if (this.queue.length > 1) {
      // Fisher-Yates shuffle algorithm
      for (let i = this.queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
      }
      
      // Update queue positions
      this.queue = this.queue.map((song, idx) => ({
        ...song,
        queuePosition: idx + 1
      }));
      
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
    // TODO: Implement playlist options dropdown
    console.log('Playlist options for:', playlist.name);
  }

  trackByPlaylist(index: number, playlist: Playlist): string {
    return playlist.id;
  }

  trackBySong(index: number, song: QueueItem): string {
    return song.id;
  }
}