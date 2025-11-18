import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserPlaylistsService, UserPlaylist } from '../services/user-playlists.service';
import { Song } from '../models/song';

@Component({
  selector: 'app-add-to-playlist-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="close()">
      <div class="modal-content glass-morphism" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">Agregar a Playlist</h2>
          <button class="close-btn" (click)="close()">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Song Info -->
          <div class="song-preview glass-morphism" *ngIf="song">
            <img [src]="song.cover || defaultCover" [alt]="song.title" class="song-cover">
            <div class="song-info">
              <h3 class="song-title">{{ song.title }}</h3>
              <p class="song-artist">{{ song.artist }}</p>
            </div>
          </div>

          <!-- Create New Playlist -->
          <div class="create-playlist-section" *ngIf="showCreateForm">
            <input 
              type="text" 
              class="form-input glass-morphism"
              [(ngModel)]="newPlaylistName"
              placeholder="Nombre de la nueva playlist"
              (keydown.enter)="createAndAddToPlaylist()"
              maxlength="100">
            <div class="create-actions">
              <button class="cancel-btn" (click)="cancelCreate()">Cancelar</button>
              <button class="create-btn neomorphism" (click)="createAndAddToPlaylist()" [disabled]="!newPlaylistName.trim() || isCreating">
                <span *ngIf="!isCreating">Crear</span>
                <span *ngIf="isCreating">Creando...</span>
              </button>
            </div>
          </div>

          <button class="new-playlist-btn glass-morphism" (click)="toggleCreateForm()" *ngIf="!showCreateForm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>Crear Nueva Playlist</span>
          </button>

          <!-- Search Playlists -->
          <div class="search-box glass-morphism" *ngIf="!showCreateForm">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none">
              <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <input 
              type="text" 
              class="search-input"
              [(ngModel)]="searchQuery"
              (input)="filterPlaylists()"
              placeholder="Buscar en tus playlists...">
          </div>

          <!-- Playlists List -->
          <div class="playlists-list" *ngIf="!showCreateForm">
            <div class="loading-state" *ngIf="isLoading">
              <div class="spinner"></div>
              <p>Cargando playlists...</p>
            </div>

            <div class="empty-state" *ngIf="!isLoading && filteredPlaylists.length === 0 && !searchQuery">
              <p>No tienes playlists aún</p>
              <p class="empty-hint">Crea tu primera playlist arriba</p>
            </div>

            <div class="empty-state" *ngIf="!isLoading && filteredPlaylists.length === 0 && searchQuery">
              <p>No se encontraron playlists</p>
            </div>

            <div 
              *ngFor="let playlist of filteredPlaylists; trackBy: trackByPlaylist"
              class="playlist-item glass-morphism"
              (click)="addToPlaylist(playlist)"
              [class.adding]="addingToPlaylist === playlist.id">
              <img [src]="playlist.cover_image_url || defaultCover" [alt]="playlist.name" class="playlist-cover">
              <div class="playlist-info">
                <h4 class="playlist-name">{{ playlist.name }}</h4>
                <p class="playlist-count">{{ playlist.song_count || 0 }} canciones</p>
              </div>
              <div class="playlist-action">
                <svg *ngIf="addingToPlaylist !== playlist.id" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                <div *ngIf="addingToPlaylist === playlist.id" class="mini-spinner"></div>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div class="success-message glass-morphism" *ngIf="showSuccess">
            <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p>Agregada a la playlist exitosamente</p>
          </div>

          <!-- Error Message -->
          <div class="error-message glass-morphism" *ngIf="errorMessage">
            <p>{{ errorMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
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
      max-height: 80vh;
      border-radius: 20px;
      animation: slideUp 0.3s ease;
      display: flex;
      flex-direction: column;
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
      margin: 0;
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

    .w-6 { width: 1.5rem; height: 1.5rem; }
    .w-5 { width: 1.25rem; height: 1.25rem; }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }

    .song-preview {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .song-cover {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      object-fit: cover;
    }

    .song-info {
      flex: 1;
      min-width: 0;
    }

    .song-title {
      font-weight: 600;
      color: #e6eefc;
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .song-artist {
      color: rgba(230, 238, 252, 0.7);
      margin: 0;
      font-size: 0.875rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .create-playlist-section {
      margin-bottom: 1rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border-radius: 10px;
      border: none;
      color: #e6eefc;
      font-size: 1rem;
      outline: none;
      margin-bottom: 1rem;
    }

    .form-input:focus {
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5);
    }

    .create-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .cancel-btn, .create-btn {
      padding: 0.6rem 1.25rem;
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

    .create-btn {
      background: linear-gradient(135deg, #8b5cf6, #3b82f6);
      color: white;
    }

    .create-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(139, 92, 246, 0.4);
    }

    .create-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .new-playlist-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      border-radius: 12px;
      border: none;
      color: #06b6d4;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 1rem;
    }

    .new-playlist-btn:hover {
      background: rgba(6, 182, 212, 0.1);
      transform: translateY(-2px);
    }

    .search-box {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      margin-bottom: 1rem;
    }

    .search-icon {
      width: 18px;
      height: 18px;
      color: rgba(230, 238, 252, 0.6);
      margin-right: 0.75rem;
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      background: none;
      border: none;
      color: #e6eefc;
      font-size: 0.95rem;
      outline: none;
    }

    .search-input::placeholder {
      color: rgba(230, 238, 252, 0.5);
    }

    .playlists-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: rgba(230, 238, 252, 0.7);
    }

    .spinner, .mini-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(139, 92, 246, 0.2);
      border-top: 3px solid #8b5cf6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    .mini-spinner {
      width: 20px;
      height: 20px;
      border-width: 2px;
      margin: 0;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-hint {
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .playlist-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 12px;
      margin-bottom: 0.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .playlist-item:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateX(5px);
    }

    .playlist-item.adding {
      pointer-events: none;
      opacity: 0.7;
    }

    .playlist-cover {
      width: 45px;
      height: 45px;
      border-radius: 8px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .playlist-info {
      flex: 1;
      min-width: 0;
    }

    .playlist-name {
      font-weight: 600;
      color: #e6eefc;
      margin: 0 0 0.25rem 0;
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .playlist-count {
      color: rgba(230, 238, 252, 0.6);
      margin: 0;
      font-size: 0.8rem;
    }

    .playlist-action {
      color: #06b6d4;
      flex-shrink: 0;
    }

    .success-message, .error-message {
      padding: 1rem;
      border-radius: 12px;
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .success-message {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #22c55e;
    }

    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    .success-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

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

    .playlists-list::-webkit-scrollbar {
      width: 6px;
    }

    .playlists-list::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }

    .playlists-list::-webkit-scrollbar-thumb {
      background: rgba(139, 92, 246, 0.5);
      border-radius: 3px;
    }

    .playlists-list::-webkit-scrollbar-thumb:hover {
      background: rgba(139, 92, 246, 0.7);
    }

    @media (max-width: 480px) {
      .modal-content {
        width: 95%;
        max-height: 85vh;
      }

      .modal-header, .modal-body {
        padding: 1rem;
      }
    }
  `]
})
export class AddToPlaylistModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() song: Song | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() added = new EventEmitter<{ playlistId: string; playlistName: string }>();

  private destroy$ = new Subject<void>();

  playlists: UserPlaylist[] = [];
  filteredPlaylists: UserPlaylist[] = [];
  searchQuery = '';
  isLoading = true;
  
  showCreateForm = false;
  newPlaylistName = '';
  isCreating = false;
  
  addingToPlaylist: string | null = null;
  showSuccess = false;
  errorMessage = '';
  
  defaultCover = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop';

  constructor(
    private playlistsService: UserPlaylistsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPlaylists();
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
      this.filterPlaylists();
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  filterPlaylists() {
    if (!this.searchQuery.trim()) {
      this.filteredPlaylists = this.playlists;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredPlaylists = this.playlists.filter(p => 
        p.name.toLowerCase().includes(query)
      );
    }
    this.cdr.markForCheck();
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.newPlaylistName = '';
    }
    this.cdr.markForCheck();
  }

  cancelCreate() {
    this.showCreateForm = false;
    this.newPlaylistName = '';
    this.cdr.markForCheck();
  }

  async createAndAddToPlaylist() {
    if (!this.newPlaylistName.trim() || !this.song) return;

    this.isCreating = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    try {
      const result = await this.playlistsService.createPlaylist(this.newPlaylistName.trim());
      
      if (result.success && result.playlist) {
        await this.addToPlaylist(result.playlist);
        this.showCreateForm = false;
        this.newPlaylistName = '';
      } else {
        this.errorMessage = result.error || 'Error al crear playlist';
      }
    } catch (error) {
      this.errorMessage = 'Error al crear playlist';
    } finally {
      this.isCreating = false;
      this.cdr.markForCheck();
    }
  }

  async addToPlaylist(playlist: UserPlaylist) {
    if (!this.song || this.addingToPlaylist) return;

    this.addingToPlaylist = playlist.id;
    this.errorMessage = '';
    this.showSuccess = false;
    this.cdr.markForCheck();

    try {
      const result = await this.playlistsService.addSongToPlaylist(playlist.id, {
        id: this.song.id,
        title: this.song.title,
        artist: this.song.artist,
        duration: this.song.duration ? this.parseDuration(this.song.duration) : undefined,
        cover: this.song.cover
      });

      if (result.success) {
        this.showSuccess = true;
        this.added.emit({ playlistId: playlist.id, playlistName: playlist.name });
        
        setTimeout(() => {
          this.close();
        }, 1500);
      } else {
        this.errorMessage = result.error || 'Error al agregar canción';
      }
    } catch (error) {
      this.errorMessage = 'Error al agregar canción';
    } finally {
      this.addingToPlaylist = null;
      this.cdr.markForCheck();
    }
  }

  private parseDuration(duration: string): number {
    const parts = duration.split(':').map(p => parseInt(p));
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  }

  close() {
    this.isOpen = false;
    this.showSuccess = false;
    this.errorMessage = '';
    this.showCreateForm = false;
    this.searchQuery = '';
    this.closed.emit();
  }

  trackByPlaylist(index: number, playlist: UserPlaylist): string {
    return playlist.id;
  }
}