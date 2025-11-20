import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UserPlaylistsService, UserPlaylist, PlaylistSong } from './services/user-playlists.service';
import { AuthStateService } from './services/auth-state.service';
import { AudioPlayerService } from './services/audio-player.service';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="playlist-detail-container" *ngIf="playlist">
      <!-- Header Section -->
      <div class="playlist-header">
        <button class="back-btn glass-morphism" (click)="goBack()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver
        </button>

        <div class="header-content">
          <div class="playlist-cover-large">
            <img [src]="playlist.cover_image_url || defaultCover" [alt]="playlist.name">
            <div class="cover-overlay">
              <button class="change-cover-btn neomorphism" (click)="changeCover()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="playlist-info-section">
            <div class="playlist-badge">PLAYLIST</div>
            <h1 class="playlist-title-large">{{ playlist.name }}</h1>
            <p class="playlist-description-large" *ngIf="playlist.description">{{ playlist.description }}</p>
            
            <div class="playlist-meta-info">
              <span class="meta-item">
                <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM22 17c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
                </svg>
                {{ songs.length }} canciones
              </span>
              <span class="meta-separator">•</span>
              <span class="meta-item">{{ formatTotalDuration() }}</span>
              <span class="meta-separator">•</span>
              <span class="meta-item" [class.public]="playlist.is_public" [class.private]="!playlist.is_public">
                <svg *ngIf="playlist.is_public" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <svg *ngIf="!playlist.is_public" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                {{ playlist.is_public ? 'Pública' : 'Privada' }}
              </span>
            </div>

            <div class="action-buttons">
              <button class="play-all-btn neomorphism" (click)="playAll()" [disabled]="songs.length === 0">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Reproducir todo
              </button>
              <button class="edit-playlist-btn glass-morphism" (click)="editPlaylist()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Editar
              </button>
              <button class="delete-playlist-btn glass-morphism" (click)="confirmDelete()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Songs List Section -->
      <div class="songs-section">
        <div class="section-header">
          <h2 class="section-title">Canciones</h2>
          <button class="add-songs-btn neomorphism" (click)="navigateToDiscover()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Agregar canciones
          </button>
        </div>

        <!-- Loading State -->
        <div class="loading-state" *ngIf="isLoading">
          <div class="spinner"></div>
          <p>Cargando canciones...</p>
        </div>

        <!-- Empty State -->
        <div class="empty-songs glass-morphism" *ngIf="!isLoading && songs.length === 0">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-width="1.5" d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM22 17c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
          </svg>
          <h3>No hay canciones en esta playlist</h3>
          <p>Comienza a agregar tu música favorita</p>
          <button class="add-first-song-btn neomorphism" (click)="navigateToDiscover()">
            Buscar canciones
          </button>
        </div>

        <!-- Songs Table -->
        <div class="songs-table" *ngIf="!isLoading && songs.length > 0">
          <!-- Table Header -->
          <div class="table-header">
            <div class="col-number">#</div>
            <div class="col-title">Título</div>
            <div class="col-artist">Artista</div>
            <div class="col-duration">Duración</div>
            <div class="col-actions">Acciones</div>
          </div>

          <!-- Table Body -->
          <div 
            *ngFor="let song of songs; let i = index; trackBy: trackBySong"
            class="table-row glass-morphism"
            [class.playing]="currentPlayingSongId === song.song_id"
            [class.dragging]="draggedSong === song"
            draggable="true"
            (dragstart)="onDragStart($event, song, i)"
            (dragover)="onDragOver($event, i)"
            (drop)="onDrop($event, i)"
            (dragend)="onDragEnd()"
          >
            <div class="col-number">
              <span class="song-number" *ngIf="currentPlayingSongId !== song.song_id">{{ i + 1 }}</span>
              <div class="playing-indicator" *ngIf="currentPlayingSongId === song.song_id">
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
              </div>
            </div>

            <div class="col-title">
              <div class="song-info">
                <img [src]="song.song_cover_url" [alt]="song.song_title" class="song-thumbnail">
                <div class="song-text">
                  <h4 class="song-name">{{ song.song_title }}</h4>
                </div>
              </div>
            </div>

            <div class="col-artist">
              <span class="artist-name">{{ song.song_artist }}</span>
            </div>

            <div class="col-duration">
              <span class="duration-text">{{ formatDuration(song.song_duration) }}</span>
            </div>

            <div class="col-actions">
              <button class="action-btn play-btn" (click)="playSong(song)" title="Reproducir">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              <button class="action-btn move-btn" title="Mover canción">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                </svg>
              </button>
              <button class="action-btn delete-btn" (click)="confirmRemoveSong(song)" title="Eliminar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Playlist Modal -->
    <div class="modal-overlay" *ngIf="showEditModal" (click)="closeEditModal()">
      <div class="modal-content glass-morphism" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">Editar Playlist</h2>
          <button class="close-btn" (click)="closeEditModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Nombre *</label>
            <input 
              type="text" 
              class="form-input glass-morphism"
              [(ngModel)]="editName"
              placeholder="Nombre de la playlist"
              maxlength="100">
          </div>

          <div class="form-group">
            <label class="form-label">Descripción</label>
            <textarea 
              class="form-textarea glass-morphism"
              [(ngModel)]="editDescription"
              placeholder="Describe tu playlist..."
              maxlength="500"
              rows="3"></textarea>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" class="form-checkbox" [(ngModel)]="editIsPublic">
              <span>Hacer pública esta playlist</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" (click)="closeEditModal()">Cancelar</button>
          <button class="save-btn neomorphism" (click)="saveEdit()" [disabled]="!editName.trim() || isSaving">
            {{ isSaving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Playlist Confirmation -->
    <div class="modal-overlay" *ngIf="showDeleteModal" (click)="cancelDelete()">
      <div class="modal-content glass-morphism delete-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">¿Eliminar Playlist?</h2>
        </div>

        <div class="modal-body">
          <p class="delete-warning">¿Estás seguro de que deseas eliminar "{{ playlist?.name }}"?</p>
          <p class="delete-note">Esta acción no se puede deshacer y se eliminarán todas las canciones de la playlist.</p>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" (click)="cancelDelete()">Cancelar</button>
          <button class="delete-confirm-btn" (click)="deletePlaylist()" [disabled]="isDeleting">
            {{ isDeleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Remove Song Confirmation -->
    <div class="modal-overlay" *ngIf="showRemoveSongModal" (click)="cancelRemoveSong()">
      <div class="modal-content glass-morphism delete-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">¿Eliminar canción?</h2>
        </div>

        <div class="modal-body">
          <p class="delete-warning">¿Deseas eliminar "{{ songToRemove?.song_title }}" de esta playlist?</p>
          <p class="delete-note">La canción se eliminará solo de esta playlist.</p>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" (click)="cancelRemoveSong()">Cancelar</button>
          <button class="delete-confirm-btn" (click)="removeSong()" [disabled]="isRemoving">
            {{ isRemoving ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="toast success" *ngIf="showSuccessToast">
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 13l4 4L19 7"/>
      </svg>
      <span>{{ toastMessage }}</span>
    </div>

    <div class="toast error" *ngIf="showErrorToast">
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 18L18 6M6 6l12 12"/>
      </svg>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Loading Overlay -->
    <div class="loading-overlay" *ngIf="!playlist && isLoading">
      <div class="spinner-large"></div>
      <p>Cargando playlist...</p>
    </div>

    <!-- Not Found -->
    <div class="not-found" *ngIf="!playlist && !isLoading">
      <svg class="not-found-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <h2>Playlist no encontrada</h2>
      <p>La playlist que buscas no existe o fue eliminada</p>
      <button class="back-home-btn neomorphism" (click)="goBack()">Volver a Playlists</button>
    </div>
  `,
  styles: [`
    .playlist-detail-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
      color: #e6eefc;
      padding-top: 80px;
    }

    /* Header Section */
    .back-btn {
      position: fixed;
      top: 90px;
      left: 2rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 25px;
      color: #e6eefc;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 100;
    }

    .back-btn svg {
      width: 20px;
      height: 20px;
    }

    .back-btn:hover {
      transform: translateX(-5px);
    }

    .playlist-header {
      padding: 3rem 2rem;
      background: linear-gradient(135deg, 
        rgba(139, 92, 246, 0.1) 0%, 
        rgba(59, 130, 246, 0.08) 50%, 
        rgba(6, 182, 212, 0.1) 100%
      );
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      gap: 2rem;
      align-items: flex-end;
    }

    .playlist-cover-large {
      width: 250px;
      height: 250px;
      border-radius: 15px;
      overflow: hidden;
      position: relative;
      flex-shrink: 0;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }

    .playlist-cover-large img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cover-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.3s ease;
    }

    .playlist-cover-large:hover .cover-overlay {
      opacity: 1;
    }

    .change-cover-btn {
      padding: 1rem;
      border: none;
      border-radius: 50%;
      color: #e6eefc;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .change-cover-btn svg {
      width: 24px;
      height: 24px;
    }

    .change-cover-btn:hover {
      transform: scale(1.1);
    }

    .playlist-info-section {
      flex: 1;
    }

    .playlist-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: rgba(139, 92, 246, 0.2);
      color: #8b5cf6;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 1rem;
    }

    .playlist-title-large {
      font-size: 3rem;
      font-weight: 900;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #e6eefc, #8b5cf6);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.1;
    }

    .playlist-description-large {
      font-size: 1.1rem;
      color: rgba(230, 238, 252, 0.8);
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .playlist-meta-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
      color: rgba(230, 238, 252, 0.9);
      font-size: 0.95rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .meta-item .icon {
      width: 16px;
      height: 16px;
    }

    .meta-item.public {
      color: #22c55e;
    }

    .meta-item.private {
      color: #ef4444;
    }

    .meta-separator {
      color: rgba(230, 238, 252, 0.4);
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .play-all-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 2rem;
      border: none;
      border-radius: 50px;
      color: #e6eefc;
      font-weight: 600;
      font-size: 1.05rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .play-all-btn svg {
      width: 20px;
      height: 20px;
    }

    .play-all-btn:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 15px 35px rgba(139, 92, 246, 0.4);
    }

    .play-all-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .edit-playlist-btn,
    .delete-playlist-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border: none;
      border-radius: 50px;
      color: #e6eefc;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .edit-playlist-btn svg,
    .delete-playlist-btn svg {
      width: 18px;
      height: 18px;
    }

    .edit-playlist-btn:hover {
      background: rgba(59, 130, 246, 0.2);
    }

    .delete-playlist-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    /* Songs Section */
    .songs-section {
      padding: 3rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
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
      background: linear-gradient(135deg, #e6eefc, #06b6d4);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .add-songs-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 25px;
      color: #e6eefc;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .add-songs-btn svg {
      width: 18px;
      height: 18px;
    }

    .add-songs-btn:hover {
      transform: translateY(-2px);
      background: linear-gradient(145deg, #06b6d4, #0891b2);
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

    /* Empty State */
    .empty-songs {
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

    .empty-songs h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #e6eefc;
      margin-bottom: 0.5rem;
    }

    .empty-songs p {
      color: rgba(230, 238, 252, 0.7);
      margin-bottom: 2rem;
    }

    .add-first-song-btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 25px;
      color: #e6eefc;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .add-first-song-btn:hover {
      transform: scale(1.05);
      background: linear-gradient(145deg, #8b5cf6, #7c3aed);
    }

    /* Songs Table */
    .songs-table {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 15px;
      padding: 1rem;
    }

    .table-header {
      display: grid;
      grid-template-columns: 50px 2fr 1.5fr 100px 120px;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(230, 238, 252, 0.6);
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .table-row {
      display: grid;
      grid-template-columns: 50px 2fr 1.5fr 100px 120px;
      gap: 1rem;
      padding: 1rem;
      margin: 0.5rem 0;
      border-radius: 10px;
      align-items: center;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .table-row:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .table-row.playing {
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.3);
    }

    .table-row.dragging {
      opacity: 0.5;
    }

    .col-number {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .song-number {
      color: rgba(230, 238, 252, 0.6);
      font-weight: 500;
    }

    .playing-indicator {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .bar {
      width: 3px;
      height: 20px;
      background: #8b5cf6;
      border-radius: 2px;
      animation: bounce 1.4s ease-in-out infinite both;
    }

    .bar:nth-child(2) { animation-delay: 0.16s; }
    .bar:nth-child(3) { animation-delay: 0.32s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scaleY(0.5); }
      40% { transform: scaleY(1); }
    }

    .song-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .song-thumbnail {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      object-fit: cover;
    }

    .song-text {
      flex: 1;
      min-width: 0;
    }

    .song-name {
      font-weight: 600;
      color: #e6eefc;
      margin-bottom: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .artist-name {
      color: rgba(230, 238, 252, 0.7);
    }

    .duration-text {
      color: rgba(230, 238, 252, 0.7);
    }

    .col-actions {
      display: flex;
      gap: 0.5rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .table-row:hover .col-actions {
      opacity: 1;
    }

    .action-btn {
      padding: 0.5rem;
      border: none;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(230, 238, 252, 0.7);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .action-btn svg {
      width: 16px;
      height: 16px;
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #e6eefc;
    }

    .action-btn.play-btn:hover {
      background: rgba(139, 92, 246, 0.2);
      color: #8b5cf6;
    }

    .action-btn.delete-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .move-btn {
      cursor: grab;
    }

    .move-btn:active {
      cursor: grabbing;
    }

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

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #e6eefc;
    }

    .close-btn {
      padding: 0.5rem;
      border-radius: 8px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(230, 238, 252, 0.7);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #e6eefc;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #e6eefc;
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border-radius: 10px;
      border: none;
      color: #e6eefc;
      font-size: 1rem;
      outline: none;
      transition: all 0.3s ease;
    }

    .form-input:focus,
    .form-textarea:focus {
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5);
    }

    .form-textarea {
      resize: vertical;
      font-family: inherit;
    }

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

    .cancel-btn,
    .save-btn,
    .delete-confirm-btn {
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

    .cancel-btn:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .save-btn {
      background: linear-gradient(135deg, #8b5cf6, #3b82f6);
      color: white;
    }

    .save-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(139, 92, 246, 0.4);
    }

    .save-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .delete-modal {
      max-width: 400px;
    }

    .delete-warning {
      font-size: 1.1rem;
      font-weight: 600;
      color: #e6eefc;
      margin-bottom: 0.5rem;
    }

    .delete-note {
      color: rgba(230, 238, 252, 0.7);
      font-size: 0.9rem;
    }

    .delete-confirm-btn {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
    }

    .delete-confirm-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(239, 68, 68, 0.4);
    }

    .delete-confirm-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Toast Notifications */
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      color: white;
      font-weight: 500;
      z-index: 2000;
      animation: slideInRight 0.3s ease;
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .toast.success {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
    }

    .toast.error {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
    }

    .toast-icon {
      width: 20px;
      height: 20px;
    }

    /* Loading Overlay */
    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(12, 12, 12, 0.95);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 999;
      color: rgba(230, 238, 252, 0.9);
    }

    .spinner-large {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(139, 92, 246, 0.2);
      border-top: 4px solid #8b5cf6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1.5rem;
    }

    /* Not Found */
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
      padding: 2rem;
    }

    .not-found-icon {
      width: 100px;
      height: 100px;
      color: rgba(230, 238, 252, 0.3);
      margin-bottom: 2rem;
    }

    .not-found h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #e6eefc;
      margin-bottom: 1rem;
    }

    .not-found p {
      color: rgba(230, 238, 252, 0.7);
      margin-bottom: 2rem;
    }

    .back-home-btn {
      padding: 1rem 2rem;
      border: none;
      border-radius: 25px;
      color: #e6eefc;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .back-home-btn:hover {
      transform: scale(1.05);
      background: linear-gradient(145deg, #8b5cf6, #7c3aed);
    }

    /* Glassmorphism & Neomorphism */
    .glass-morphism {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .neomorphism {
      background: linear-gradient(145deg, #1a1a1a, #0f0f0f);
      box-shadow: 
        5px 5px 10px rgba(0, 0, 0, 0.5),
        -5px -5px 10px rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .header-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .playlist-title-large {
        font-size: 2.5rem;
      }

      .table-header,
      .table-row {
        grid-template-columns: 40px 2fr 1fr 80px 100px;
        gap: 0.5rem;
        padding: 0.75rem 0.5rem;
      }
    }

    @media (max-width: 768px) {
      .playlist-detail-container {
        padding-top: 70px;
      }

      .back-btn {
        top: 80px;
        left: 1rem;
        padding: 0.5rem 1rem;
      }

      .playlist-header {
        padding: 2rem 1rem;
      }

      .playlist-cover-large {
        width: 200px;
        height: 200px;
      }

      .playlist-title-large {
        font-size: 2rem;
      }

      .songs-section {
        padding: 2rem 1rem;
      }

      .section-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .table-header {
        display: none;
      }

      .table-row {
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1rem;
      }

      .col-number,
      .col-duration {
        display: none;
      }

      .col-title {
        grid-column: 1;
      }

      .col-artist {
        grid-column: 1;
        margin-left: 66px;
      }

      .col-actions {
        grid-column: 1;
        opacity: 1;
        justify-content: flex-end;
      }

      .action-buttons {
        flex-direction: column;
        width: 100%;
      }

      .play-all-btn,
      .edit-playlist-btn,
      .delete-playlist-btn {
        width: 100%;
        justify-content: center;
      }

      .toast {
        bottom: 1rem;
        right: 1rem;
        left: 1rem;
      }
    }

    @media (max-width: 480px) {
      .playlist-cover-large {
        width: 150px;
        height: 150px;
      }

      .playlist-title-large {
        font-size: 1.5rem;
      }

      .playlist-meta-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .meta-separator {
        display: none;
      }
    }
  `]
})
export class PlaylistDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  playlistId: string | null = null;
  playlist: UserPlaylist | null = null;
  songs: PlaylistSong[] = [];
  isLoading = true;
  
  // Drag and drop
  draggedSong: PlaylistSong | null = null;
  draggedIndex: number = -1;

  // Edit modal
  showEditModal = false;
  editName = '';
  editDescription = '';
  editIsPublic = false;
  isSaving = false;

  // Delete modals
  showDeleteModal = false;
  isDeleting = false;
  showRemoveSongModal = false;
  songToRemove: PlaylistSong | null = null;
  isRemoving = false;
  

  // Player state
  currentPlayingSongId: string | null = null;
  

  // Toast
  showSuccessToast = false;
  showErrorToast = false;
  toastMessage = '';

  defaultCover = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private playlistsService: UserPlaylistsService,
    private authStateService: AuthStateService
    , private audioPlayer: AudioPlayerService
  ) {}

  async ngOnInit() {
    // Verificar autenticación
    const user = await this.authStateService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/auth']);
      return;
    }

    // Obtener ID de la playlist de la ruta
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.playlistId = params.get('id');
      if (this.playlistId) {
        this.loadPlaylistData();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadPlaylistData() {
    if (!this.playlistId) return;

    this.isLoading = true;
    this.cdr.markForCheck();

    // Cargar playlists para obtener la información
    await this.playlistsService.loadUserPlaylists();
    
    this.playlistsService.playlists$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(playlists => {
      this.playlist = playlists.find(p => p.id === this.playlistId) || null;
      this.cdr.markForCheck();
    });

    // Cargar canciones de la playlist
    const result = await this.playlistsService.getPlaylistSongs(this.playlistId);
    
    if (result.success && result.songs) {
      this.songs = result.songs;
    }

    this.isLoading = false;
    this.cdr.markForCheck();
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  formatTotalDuration(): string {
    const totalSeconds = this.songs.reduce((sum, song) => sum + (song.song_duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} h ${minutes} min`;
    }
    return `${minutes} min`;
  }

  // Drag and Drop
  onDragStart(event: DragEvent, song: PlaylistSong, index: number) {
    this.draggedSong = song;
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  async onDrop(event: DragEvent, dropIndex: number) {
    event.preventDefault();
    
    if (this.draggedSong && this.draggedIndex !== dropIndex && this.playlistId) {
      const fromPosition = this.draggedIndex + 1;
      const toPosition = dropIndex + 1;
      
      const result = await this.playlistsService.moveSongPosition(
        this.playlistId,
        fromPosition,
        toPosition
      );

      if (result.success) {
        await this.loadPlaylistData();
        this.showToast('Canción reordenada', 'success');
      } else {
        this.showToast('Error al reordenar canción', 'error');
      }
    }
  }

  onDragEnd() {
    this.draggedSong = null;
    this.draggedIndex = -1;
  }

  // Edit Playlist
  editPlaylist() {
    if (!this.playlist) return;
    
    this.editName = this.playlist.name;
    this.editDescription = this.playlist.description || '';
    this.editIsPublic = this.playlist.is_public;
    this.showEditModal = true;
    this.cdr.markForCheck();
  }

  closeEditModal() {
    this.showEditModal = false;
    this.cdr.markForCheck();
  }

  async saveEdit() {
    if (!this.playlist || !this.editName.trim()) return;

    this.isSaving = true;
    this.cdr.markForCheck();

    const result = await this.playlistsService.updatePlaylist(this.playlist.id, {
      name: this.editName.trim(),
      description: this.editDescription.trim() || undefined,
      is_public: this.editIsPublic
    });

    this.isSaving = false;

    if (result.success) {
      await this.loadPlaylistData();
      this.showToast('Playlist actualizada', 'success');
      this.closeEditModal();
    } else {
      this.showToast(result.error || 'Error al actualizar playlist', 'error');
    }

    this.cdr.markForCheck();
  }

  // Delete Playlist
  confirmDelete() {
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.cdr.markForCheck();
  }

  async deletePlaylist() {
    if (!this.playlist) return;

    this.isDeleting = true;
    this.cdr.markForCheck();

    const result = await this.playlistsService.deletePlaylist(this.playlist.id);

    this.isDeleting = false;

    if (result.success) {
      this.showToast('Playlist eliminada', 'success');
      setTimeout(() => {
        this.router.navigate(['/playlists']);
      }, 1500);
    } else {
      this.showToast(result.error || 'Error al eliminar playlist', 'error');
    }

    this.cdr.markForCheck();
  }

  // Remove Song
  confirmRemoveSong(song: PlaylistSong) {
    this.songToRemove = song;
    this.showRemoveSongModal = true;
    this.cdr.markForCheck();
  }

  cancelRemoveSong() {
    this.showRemoveSongModal = false;
    this.songToRemove = null;
    this.cdr.markForCheck();
  }

  async removeSong() {
    if (!this.songToRemove || !this.playlistId) return;

    this.isRemoving = true;
    this.cdr.markForCheck();

    const result = await this.playlistsService.removeSongFromPlaylist(
      this.playlistId,
      this.songToRemove.song_id
    );

    this.isRemoving = false;

    if (result.success) {
      await this.loadPlaylistData();
      this.showToast('Canción eliminada de la playlist', 'success');
      this.cancelRemoveSong();
    } else {
      this.showToast(result.error || 'Error al eliminar canción', 'error');
    }

    this.cdr.markForCheck();
  }

  // Player actions
  // Player actions actualizados
  playSong(song: PlaylistSong) {
    const queue = this.songs.map(s => ({
      id: s.song_id,
      title: s.song_title,
      artist: s.song_artist,
      duration: s.song_duration,
      cover: s.song_cover_url,
      audioPath: undefined,
      requiresSignedUrl: false // o true, según necesites
    }));
    const index = this.songs.findIndex(s => s.song_id === song.song_id);
    if (index !== -1) {
      this.audioPlayer.playTrack(queue[index], queue, index);
    }
    this.currentPlayingSongId = song.song_id;
    this.showToast(`Reproduciendo "${song.song_title}"`, 'success');
    this.cdr.markForCheck();
  }

  playAll() {
    if (this.songs.length === 0) return;
    const queue = this.songs.map(s => ({
      id: s.song_id,
      title: s.song_title,
      artist: s.song_artist,
      duration: s.song_duration,
      cover: s.song_cover_url,
      audioPath: undefined,
      requiresSignedUrl: false
    }));
    this.audioPlayer.playTrack(queue[0], queue, 0);
    this.currentPlayingSongId = this.songs[0].song_id;
    this.showToast('Reproduciendo playlist', 'success');
    this.cdr.markForCheck();
  }

  // Navigation
  goBack() {
    this.router.navigate(['/playlists']);
  }

  navigateToDiscover() {
    this.router.navigate(['/discover']);
  }

  changeCover() {
    this.showToast('Funcionalidad próximamente', 'success');
  }

  // Toast
  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    if (type === 'success') {
      this.showSuccessToast = true;
      setTimeout(() => {
        this.showSuccessToast = false;
        this.cdr.markForCheck();
      }, 3000);
    } else {
      this.showErrorToast = true;
      setTimeout(() => {
        this.showErrorToast = false;
        this.cdr.markForCheck();
      }, 3000);
    }
    this.cdr.markForCheck();
  }

  // Track By
  trackBySong(index: number, song: PlaylistSong): string {
    return song.song_id;
  }
  
}