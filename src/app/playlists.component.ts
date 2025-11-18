import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UserPlaylistsService, UserPlaylist, PlaylistSong } from './services/user-playlists.service';
import { AuthStateService } from './services/auth-state.service';
import { Song } from './models/song';

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

          <!-- Empty State -->
          <div class="empty-state glass-morphism" *ngIf="playlists.length === 0 && !isLoading">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM22 17c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"></path>
            </svg>
            <h3 class="empty-title">No tienes playlists aún</h3>
            <p class="empty-text">Crea tu primera playlist para comenzar a organizar tu música</p>
            <button class="create-first-btn neomorphism" (click)="toggleCreateModal()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <span>Crear mi primera playlist</span>
            </button>
          </div>

          <!-- Loading State -->
          <div class="loading-state" *ngIf="isLoading">
            <div class="spinner"></div>
            <p>Cargando playlists...</p>
          </div>

          <!-- Playlists Grid/List -->
          <div class="playlists-content" [class.list-view]="viewMode === 'list'" [class.grid-view]="viewMode === 'grid'" *ngIf="playlists.length > 0 && !isLoading">
            <div 
              *ngFor="let playlist of playlists; trackBy: trackByPlaylist; let i = index"
              class="playlist-card glass-morphism fade-in-up"
              [class.selected]="selectedPlaylist?.id === playlist.id"
              [style.animation-delay.s]="i * 0.1"
              (click)="selectPlaylist(playlist)">
              <div class="playlist-cover">
                <img [src]="playlist.cover_image_url || defaultPlaylistCover" [alt]="playlist.name" loading="lazy">
                <div class="playlist-overlay">
                  <button class="play-all-btn neomorphism" (click)="playPlaylist(playlist, $event)">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
                <!-- Privacy Badge -->
                <div class="privacy-badge" [class.public]="playlist.is_public" [class.private]="!playlist.is_public">
                  <svg *ngIf="playlist.is_public" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <svg *ngIf="!playlist.is_public" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
              </div>
              
              <div class="playlist-info">
                <h3 class="playlist-name">{{ playlist.name }}</h3>
                <p class="playlist-description" *ngIf="viewMode === 'grid' && playlist.description">{{ playlist.description }}</p>
                <div class="playlist-meta">
                  <span class="song-count">{{ playlist.song_count || 0 }} canciones</span>
                </div>
              </div>
              
              <!-- Playlist Actions -->
              <div class="playlist-actions">
                <button class="action-btn" (click)="editPlaylist(playlist, $event)" title="Editar">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button class="action-btn delete-btn" (click)="confirmDeletePlaylist(playlist, $event)" title="Eliminar">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
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
              [class.playing]="song.isCurrentlyPlaying">
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
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
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

    <!-- Create/Edit Playlist Modal -->
    <div class="modal-overlay" *ngIf="showCreateModal" (click)="toggleCreateModal()">
      <div class="modal-content glass-morphism" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">{{ isEditMode ? 'Editar Playlist' : 'Crear Nueva Playlist' }}</h2>
          <button class="close-btn" (click)="toggleCreateModal()">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="playlist-name" class="form-label">Nombre de la Playlist *</label>
            <input 
              type="text" 
              id="playlist-name" 
              class="form-input glass-morphism"
              [(ngModel)]="newPlaylistName"
              placeholder="Mi playlist favorita"
              maxlength="100"
              (keydown.enter)="savePlaylist()">
          </div>
          
          <div class="form-group">
            <label for="playlist-description" class="form-label">Descripción (opcional)</label>
            <textarea 
              id="playlist-description" 
              class="form-textarea glass-morphism"
              [(ngModel)]="newPlaylistDescription"
              placeholder="Describe tu playlist..."
              maxlength="500"
              rows="3"></textarea>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                class="form-checkbox"
                [(ngModel)]="newPlaylistIsPublic">
              <span>Hacer pública esta playlist</span>
            </label>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-btn" (click)="toggleCreateModal()">Cancelar</button>
          <button class="save-btn neomorphism" (click)="savePlaylist()" [disabled]="!newPlaylistName.trim() || isSaving">
            <span *ngIf="!isSaving">{{ isEditMode ? 'Guardar Cambios' : 'Crear Playlist' }}</span>
            <span *ngIf="isSaving">Guardando...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay" *ngIf="showDeleteModal" (click)="cancelDelete()">
      <div class="modal-content glass-morphism delete-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">¿Eliminar Playlist?</h2>
        </div>
        
        <div class="modal-body">
          <p class="delete-warning">¿Estás seguro de que deseas eliminar "{{ playlistToDelete?.name }}"?</p>
          <p class="delete-note">Esta acción no se puede deshacer y se eliminarán todas las canciones de la playlist.</p>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-btn" (click)="cancelDelete()">Cancelar</button>
          <button class="delete-confirm-btn" (click)="deletePlaylist()" [disabled]="isDeleting">
            <span *ngIf="!isDeleting">Eliminar</span>
            <span *ngIf="isDeleting">Eliminando...</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .playlists-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
      color: #e6eefc;
      padding-top: 80px;
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

    .w-5 { width: 1.25rem; height: 1.25rem; }
    .mr-2 { margin-right: 0.5rem; }

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

    .note-1 { top: 20%; left: 15%; animation-delay: 0s; }
    .note-2 { top: 60%; right: 20%; animation-delay: 3s; }
    .note-3 { bottom: 25%; left: 25%; animation-delay: 6s; }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
      50% { transform: translateY(-30px) rotate(180deg); opacity: 0.6; }
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
    .playlists-panel { min-height: 600px; }

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

    .view-toggles { display: flex; gap: 0.5rem; }

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

    .w-4 { width: 1rem; height: 1rem; }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      border-radius: 20px;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      color: rgba(139, 92, 246, 0.5);
    }

    .empty-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #e6eefc;
      margin-bottom: 0.5rem;
    }

    .empty-text {
      color: rgba(230, 238, 252, 0.7);
      margin-bottom: 2rem;
    }

    .create-first-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      border: none;
      color: #e6eefc;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .create-first-btn:hover {
      transform: scale(1.05);
      background: linear-gradient(145deg, #8b5cf6, #7c3aed);
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: rgba(230, 238, 252, 0.7);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(139, 92, 246, 0.2);
      border-top: 3px solid #8b5cf6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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

    .playlists-content.grid-view .playlist-card { display: flex; flex-direction: column; }
    .playlists-content.list-view .playlist-card { display: flex; flex-direction: row; align-items: center; gap: 1rem; }

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

    .playlists-content.grid-view .playlist-cover { width: 100%; aspect-ratio: 1; }
    .playlists-content.list-view .playlist-cover { width: 60px; height: 60px; margin-bottom: 0; }

    .playlist-cover img { width: 100%; height: 100%; object-fit: cover; }

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

    .playlist-card:hover .playlist-overlay { opacity: 1; }

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

    .play-all-btn svg { width: 20px; height: 20px; margin-left: 2px; }
    .play-all-btn:hover { transform: scale(1.1); color: #7c3aed; }

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

    .privacy-badge.public { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    .privacy-badge.private { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .w-3 { width: 0.75rem; height: 0.75rem; }

    .playlist-info { flex: 1; }

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
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .playlist-meta { display: flex; gap: 0.5rem; font-size: 0.85rem; color: rgba(230, 238, 252, 0.6); }
    .playlist-actions { display: flex; gap: 0.5rem; }

    .action-btn {
      padding: 0.5rem;
      border-radius: 8px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(230, 238, 252, 0.7);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .action-btn:hover { background: rgba(255, 255, 255, 0.15); color: #e6eefc; }
    .delete-btn:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

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

    .queue-title { display: flex; align-items: center; font-size: 1.25rem; font-weight: 600; color: #e6eefc; }
    .queue-controls { display: flex; gap: 0.5rem; }

    .queue-control-btn {
      padding: 0.5rem;
      border-radius: 8px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(230, 238, 252, 0.7);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .queue-control-btn:hover { background: rgba(255, 255, 255, 0.15); color: #e6eefc; }
    .queue-control-btn.active { background: #8b5cf6; color: white; }

    /* Current Playing */
    .current-playing { display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 15px; margin-bottom: 1.5rem; }
    .current-cover { width: 60px; height: 60px; border-radius: 10px; overflow: hidden; position: relative; }
    .current-cover img { width: 100%; height: 100%; object-fit: cover; }

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

    .bar:nth-child(2) { animation-delay: 0.16s; }
    .bar:nth-child(3) { animation-delay: 0.32s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scaleY(0.5); }
      40% { transform: scaleY(1); }
    }

    .current-info { flex: 1; }
    .current-title { font-weight: 600; color: #e6eefc; margin-bottom: 0.25rem; font-size: 0.95rem; }
    .current-artist { color: rgba(230, 238, 252, 0.7); font-size: 0.85rem; }

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

    .pause-btn svg { width: 16px; height: 16px; }
    .pause-btn:hover { transform: scale(1.1); box-shadow: 0 5px 15px rgba(139, 92, 246, 0.4); }

    /* Queue List */
    .queue-list { flex: 1; overflow-y: auto; }
    .queue-info { font-size: 0.85rem; color: rgba(230, 238, 252, 0.6); margin-bottom: 1rem; padding: 0.5rem; }
    .queue-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1rem; }
    .w-12 { width: 3rem; height: 3rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .text-gray-500 { color: #6b7280; }
    .text-gray-400 { color: #9ca3af; }
    .text-center { text-align: center; }
    .text-sm { font-size: 0.875rem; }
    .mt-2 { margin-top: 0.5rem; }

    .queue-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0.5rem;
      border-radius: 10px;
      margin-bottom: 0.5rem;
      transition: all 0.3s ease;
    }

    .queue-item:hover { background: rgba(255, 255, 255, 0.05); }
    .queue-item.playing { background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); }
    .queue-position { width: 20px; text-align: center; font-size: 0.85rem; color: rgba(230, 238, 252, 0.6); }

    .playing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #8b5cf6;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
      100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
    }

    .queue-cover { width: 40px; height: 40px; border-radius: 6px; overflow: hidden; }
    .queue-cover img { width: 100%; height: 100%; object-fit: cover; }
    .queue-info-item { flex: 1; }
    .queue-song-title { font-size: 0.9rem; font-weight: 500; color: #e6eefc; margin-bottom: 0.2rem; }
    .queue-song-artist { font-size: 0.8rem; color: rgba(230, 238, 252, 0.7); }
    .queue-duration { font-size: 0.8rem; color: rgba(230, 238, 252, 0.6); margin-right: 0.5rem; }
    .queue-actions { display: flex; gap: 0.25rem; opacity: 0; transition: opacity 0.3s ease; }
    .queue-item:hover .queue-actions { opacity: 1; }

    .queue-action-btn {
      padding: 0.25rem;
      border-radius: 4px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(230, 238, 252, 0.7);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .queue-action-btn:hover { background: rgba(255, 255, 255, 0.2); color: #e6eefc; }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      width: 90%;
      max-width: 500px;
      border-radius: 20px;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .modal-title { font-size: 1.5rem; font-weight: 700; color: #e6eefc; }
    .w-6 { width: 1.5rem; height: 1.5rem; }

    .close-btn {
      padding: 0.5rem;
      border-radius: 8px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(230, 238, 252, 0.7);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .close-btn:hover { background: rgba(255, 255, 255, 0.15); color: #e6eefc; }
    .modal-body { padding: 1.5rem; }
    .form-group { margin-bottom: 1.5rem; }
    .form-label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #e6eefc; }

    .form-input, .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border-radius: 10px;
      border: none;
      color: #e6eefc;
      font-size: 1rem;
      outline: none;
      transition: all 0.3s ease;
    }

    .form-input:focus, .form-textarea:focus {
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5);
    }

    .form-textarea { resize: vertical; font-family: inherit; }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      color: rgba(230, 238, 252, 0.9);
    }

    .form-checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #8b5cf6;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .cancel-btn, .save-btn, .delete-confirm-btn {
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .cancel-btn {
      background: rgba(255, 255, 255, 0.1);
      color: #e6eefc;
    }

    .cancel-btn:hover { background: rgba(255, 255, 255, 0.15); }

    .save-btn {
      background: linear-gradient(135deg, #8b5cf6, #3b82f6);
      color: white;
    }

    .save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(139, 92, 246, 0.4); }
    .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .delete-modal { max-width: 400px; }
    .delete-warning { font-size: 1.1rem; font-weight: 600; color: #e6eefc; margin-bottom: 0.5rem; }
    .delete-note { color: rgba(230, 238, 252, 0.7); font-size: 0.9rem; }

    .delete-confirm-btn {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
    }

    .delete-confirm-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(239, 68, 68, 0.4); }
    .delete-confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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

    /* Animation Classes */
    .fade-in-up { animation: fadeInUp 0.8s ease-out; animation-fill-mode: both; }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Scrollbar */
    .queue-list::-webkit-scrollbar { width: 6px; }
    .queue-list::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 3px; }
    .queue-list::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.5); border-radius: 3px; }
    .queue-list::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.7); }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .main-content { grid-template-columns: 1fr; gap: 2rem; }
      .queue-panel { max-height: 500px; }
    }

    @media (max-width: 768px) {
      .playlists-container { padding-top: 70px; }
      .hero-title { font-size: 2.5rem; }
      .hero-subtitle { font-size: 1rem; }
      .main-content { padding: 1rem; }
      .section-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
      .playlists-content.grid-view { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
      .queue-panel { padding: 1rem; }
    }

    @media (max-width: 480px) {
      .playlists-container { padding-top: 65px; }
      .create-playlist-btn { padding: 0.8rem 1.5rem; font-size: 0.9rem; }
      .playlists-content.grid-view { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
      .playlist-card { padding: 1rem; }
      .main-content { gap: 1.5rem; }
      .modal-content { width: 95%; }
    }
  `]
})
export class PlaylistsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  viewMode: 'grid' | 'list' = 'grid';
  selectedPlaylist: UserPlaylist | null = null;
  queue: QueueItem[] = [];
  currentSong: Song | null = null;
  isPlaying = false;
  isShuffled = false;
  isLoading = true;

  playlists: UserPlaylist[] = [];
  playlistSongs: Map<string, PlaylistSong[]> = new Map();
  defaultPlaylistCover = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop';

  // Modal states
  showCreateModal = false;
  showDeleteModal = false;
  isEditMode = false;
  isSaving = false;
  isDeleting = false;

  // Form data
  newPlaylistName = '';
  newPlaylistDescription = '';
  newPlaylistIsPublic = false;
  editingPlaylistId: string | null = null;
  playlistToDelete: UserPlaylist | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private playlistsService: UserPlaylistsService,
    private authStateService: AuthStateService
  ) {}

  ngOnInit() {
    // Verificar autenticación
    this.authStateService.user$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (!user) {
        this.router.navigate(['/auth']);
        return;
      }
      this.loadPlaylists();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPlaylists() {
    this.playlistsService.playlists$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(playlists => {
      this.playlists = playlists;
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  async selectPlaylist(playlist: UserPlaylist) {
    this.selectedPlaylist = playlist;
    
    // Cargar canciones de la playlist si aún no están cargadas
    if (!this.playlistSongs.has(playlist.id)) {
      const result = await this.playlistsService.getPlaylistSongs(playlist.id);
      if (result.success && result.songs) {
        this.playlistSongs.set(playlist.id, result.songs);
      }
    }
    
    this.cdr.detectChanges();
  }

  async playPlaylist(playlist: UserPlaylist, event: Event) {
    event.stopPropagation();
    this.selectedPlaylist = playlist;
    
    // Cargar canciones de la playlist
    const result = await this.playlistsService.getPlaylistSongs(playlist.id);
    if (!result.success || !result.songs || result.songs.length === 0) {
      console.log('No hay canciones en esta playlist');
      return;
    }

    const songs = result.songs;
    
    // Convertir PlaylistSong[] a Song[]
    const songsAsQueue: Song[] = songs.map(ps => ({
      id: ps.song_id,
      title: ps.song_title,
      artist: ps.song_artist,
      cover: ps.song_cover_url,
      duration: ps.song_duration?.toString(),
      audioPath: '', // Se necesitará configurar esto
      requiresSignedUrl: false
    }));
    
    // Clear current queue and add all songs from playlist
    this.queue = songsAsQueue.map((song, index) => ({
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

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
    this.cdr.detectChanges();
  }

  toggleCreateModal() {
    this.showCreateModal = !this.showCreateModal;
    if (!this.showCreateModal) {
      // Reset form
      this.resetForm();
    }
    this.cdr.detectChanges();
  }

  editPlaylist(playlist: UserPlaylist, event: Event) {
    event.stopPropagation();
    this.isEditMode = true;
    this.editingPlaylistId = playlist.id;
    this.newPlaylistName = playlist.name;
    this.newPlaylistDescription = playlist.description || '';
    this.newPlaylistIsPublic = playlist.is_public;
    this.showCreateModal = true;
    this.cdr.detectChanges();
  }

  confirmDeletePlaylist(playlist: UserPlaylist, event: Event) {
    event.stopPropagation();
    this.playlistToDelete = playlist;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.playlistToDelete = null;
    this.cdr.detectChanges();
  }

  async savePlaylist() {
    if (!this.newPlaylistName.trim()) return;

    this.isSaving = true;
    this.cdr.detectChanges();

    try {
      if (this.isEditMode && this.editingPlaylistId) {
        // Update existing playlist
        const result = await this.playlistsService.updatePlaylist(this.editingPlaylistId, {
          name: this.newPlaylistName.trim(),
          description: this.newPlaylistDescription.trim() || undefined,
          is_public: this.newPlaylistIsPublic
        });

        if (result.success) {
          console.log('Playlist actualizada exitosamente');
        } else {
          console.error('Error al actualizar playlist:', result.error);
        }
      } else {
        // Create new playlist
        const result = await this.playlistsService.createPlaylist(
          this.newPlaylistName.trim(),
          this.newPlaylistDescription.trim() || undefined
        );

        if (result.success) {
          console.log('Playlist creada exitosamente');
        } else {
          console.error('Error al crear playlist:', result.error);
        }
      }

      this.toggleCreateModal();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }

  async deletePlaylist() {
    if (!this.playlistToDelete) return;

    this.isDeleting = true;
    this.cdr.detectChanges();

    try {
      const result = await this.playlistsService.deletePlaylist(this.playlistToDelete.id);

      if (result.success) {
        console.log('Playlist eliminada exitosamente');
        if (this.selectedPlaylist?.id === this.playlistToDelete.id) {
          this.selectedPlaylist = null;
        }
      } else {
        console.error('Error al eliminar playlist:', result.error);
      }

      this.cancelDelete();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.isDeleting = false;
      this.cdr.detectChanges();
    }
  }

  private resetForm() {
    this.isEditMode = false;
    this.editingPlaylistId = null;
    this.newPlaylistName = '';
    this.newPlaylistDescription = '';
    this.newPlaylistIsPublic = false;
  }

  trackByPlaylist(index: number, playlist: UserPlaylist): string {
    return playlist.id;
  }

  trackBySong(index: number, song: QueueItem): string {
    return song.id;
  }
}