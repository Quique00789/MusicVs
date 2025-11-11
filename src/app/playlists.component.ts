import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule],
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
      <!-- Modal for creating playlist -->
      <div *ngIf="showCreateModal" class="modal-bg">
        <div class="modal glass-morphism">
          <h2 class="modal-title">Crear nueva Playlist</h2>
          <form class="modal-form" (ngSubmit)="createPlaylist()" #form="ngForm">
            <label>Nombre</label>
            <input type="text" [(ngModel)]="newPlaylist.name" required name="plname" placeholder="Nombre" class="input" />
            <label>Descripción</label>
            <input type="text" [(ngModel)]="newPlaylist.description" name="pldesc" placeholder="Descripción" class="input" />
            <label>Portada (URL)</label>
            <input type="text" [(ngModel)]="newPlaylist.cover" name="plimg" placeholder="URL imagen" class="input" />
            <div *ngIf="newPlaylist.cover" class="preview"><img [src]="newPlaylist.cover" alt="Cover" /></div>
            <div class="switch-row">
              <label class="switch-label">Pública</label>
              <input type="checkbox" [(ngModel)]="newPlaylist.isPublic" name="plpublic" />
            </div>
            <div class="modal-actions">
              <button type="submit" [disabled]="!newPlaylist.name" class="save-btn">Guardar</button>
              <button type="button" (click)="toggleCreateModal()" class="cancel-btn">Cancelar</button>
            </div>
          </form>
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
        <!-- Right Panel permanece igual -->
        <div class="queue-panel glass-morphism"> <!-- ... --> </div>
      </div>
    </div>
  `,
  styles: [
    `.modal-bg {position:fixed;top:0;left:0;width:100vw;height:100vh;background:#18181bde;z-index:200;display:flex;align-items:center;justify-content:center;}
    .modal {border-radius:16px;padding:2rem 2rem;box-shadow:0 8px 32px rgba(0,0,0,.38);max-width:350px;width:95vw;position:relative;}
    .modal-title {font-size:2rem;font-weight:700;text-align:center;margin-bottom:1.5rem;background:linear-gradient(135deg,#8b5cf6,#3b82f6,#06b6d4);background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
    .modal-form {display:flex;flex-direction:column;gap:.8rem;}
    label {font-size:1rem;font-weight:600;margin-bottom:.15rem;}
    .input {background:#232332;border-radius:8px;padding:.55rem .9rem;font-size:1rem;color:#e6eefc;border:1px solid #444;margin-bottom:.5rem;outline:none;}
    .input:focus {border-color:#8b5cf6;}
    .preview {margin:0.7rem 0;text-align:center;}
    .preview img {max-width:80px;border-radius:6px;box-shadow:0 5px 20px rgba(139,92,246,.1);border:2px solid #444;}
    .switch-row {display:flex;align-items:center;gap:.55rem;margin-top:.7rem;}
    .switch-label {font-size:1rem;font-weight:600;}
    .modal-actions {display:flex;gap:.9rem;justify-content:space-between;margin-top:1.1rem;}
    .save-btn {background:linear-gradient(90deg,#8b5cf6,#06b6d4);color:#fff;font-weight:600;padding:.7rem 1.4rem;border:none;border-radius:8px;cursor:pointer;box-shadow:0 4px 18px rgba(139,92,246,.16);transition:.2s;}
    .save-btn:disabled {background:gray;cursor:not-allowed;}
    .cancel-btn {background:#373737;color:#e6eefc;padding:.7rem 1.4rem;border:none;border-radius:8px;cursor:pointer;font-weight:600;transition:.2s;}
    .modal-btn-close {position:absolute;top:10px;right:22px;font-size:2rem;background:none;color:#fff;border:none;}
    /* resto de estilos siguen igual */
  `]
})
export class PlaylistsComponent implements OnInit {
  viewMode: 'grid' | 'list' = 'grid';
  selectedPlaylist: Playlist | null = null;
  queue: QueueItem[] = [];
  currentSong: Song | null = null;
  isPlaying = false;
  isShuffled = false;
  showCreateModal = false;
  newPlaylist = { name: '', description: '', cover: '', isPublic: false };

  playlists: Playlist[] = [ /* ... igual ... */ ];

  constructor(private cdr: ChangeDetectorRef) {}
  ngOnInit() {}
  // ... resto igual ...
}
