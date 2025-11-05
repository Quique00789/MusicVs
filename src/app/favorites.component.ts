import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FavoritesService, FavoriteSong } from './services/favorites.service';
import { AudioPlayerService } from './services/audio-player.service';
import { AuthStateService } from './services/auth-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="favorites-container">
      <div class="favorites-header">
        <h1 class="favorites-title">Mis Favoritos</h1>
        <p class="favorites-subtitle" *ngIf="favorites.length > 0">
          {{ favorites.length }} canción{{ favorites.length !== 1 ? 'es' : '' }}
        </p>
      </div>

      <div class="favorites-content" *ngIf="!isLoading">
        <div class="empty-state" *ngIf="favorites.length === 0">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h2 class="empty-title">No tienes favoritos aún</h2>
          <p class="empty-description">Agrega canciones a tus favoritos para verlas aquí</p>
          <button 
            class="explore-button"
            (click)="navigateToDiscover()">
            Explorar Música
          </button>
        </div>

        <div class="favorites-list" *ngIf="favorites.length > 0">
          <div 
            class="song-item" 
            *ngFor="let song of favorites; let i = index"
            (click)="playSong(song, i)"
            [class.playing]="isCurrentSong(song.song_id)">
            
            <div class="song-cover">
              <img 
                [src]="song.song_cover_url || '/assets/default-cover.jpg'" 
                [alt]="song.song_title"
                class="cover-image"
                (error)="onImageError($event)">
              
              <div class="play-overlay" *ngIf="!isCurrentSong(song.song_id)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              
              <div class="playing-indicator" *ngIf="isCurrentSong(song.song_id)">
                <div class="bars">
                  <div class="bar"></div>
                  <div class="bar"></div>
                  <div class="bar"></div>
                </div>
              </div>
            </div>

            <div class="song-info">
              <h3 class="song-title" [title]="song.song_title">{{ song.song_title }}</h3>
              <p class="song-artist" [title]="song.song_artist">{{ song.song_artist }}</p>
            </div>

            <div class="song-duration" *ngIf="song.song_duration">
              {{ formatDuration(song.song_duration) }}
            </div>

            <button 
              class="remove-favorite"
              (click)="removeFavorite($event, song.song_id)"
              title="Quitar de favoritos">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Cargando favoritos...</p>
      </div>
    </div>
  `,
  styles: [`
    .favorites-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .favorites-header {
      margin-bottom: 2rem;
    }

    .favorites-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
    }

    .favorites-subtitle {
      color: #a1a1aa;
      font-size: 1rem;
      margin: 0;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-icon {
      margin-bottom: 1.5rem;
      color: #71717a;
    }

    .empty-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
    }

    .empty-description {
      color: #a1a1aa;
      margin: 0 0 2rem 0;
    }

    .explore-button {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .explore-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }

    .favorites-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .song-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      border-radius: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .song-item:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }

    .song-item.playing {
      background: rgba(99, 102, 241, 0.2);
      border-left: 3px solid #6366f1;
    }

    .song-cover {
      position: relative;
      width: 48px;
      height: 48px;
      border-radius: 0.25rem;
      overflow: hidden;
      flex-shrink: 0;
    }

    .cover-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .play-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .song-item:hover .play-overlay {
      opacity: 1;
    }

    .playing-indicator {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(99, 102, 241, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bars {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .bar {
      width: 3px;
      height: 12px;
      background: white;
      border-radius: 1px;
      animation: bounce 1s infinite ease-in-out;
    }

    .bar:nth-child(2) {
      animation-delay: 0.1s;
    }

    .bar:nth-child(3) {
      animation-delay: 0.2s;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: scaleY(0.4);
      }
      40% {
        transform: scaleY(1);
      }
      60% {
        transform: scaleY(0.8);
      }
    }

    .song-info {
      flex: 1;
      min-width: 0;
    }

    .song-title {
      font-size: 1rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 0.25rem 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .song-artist {
      font-size: 0.875rem;
      color: #a1a1aa;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .song-duration {
      color: #a1a1aa;
      font-size: 0.875rem;
      font-variant-numeric: tabular-nums;
    }

    .remove-favorite {
      background: none;
      border: none;
      color: #ef4444;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.25rem;
      transition: all 0.2s ease;
      opacity: 0.7;
    }

    .remove-favorite:hover {
      opacity: 1;
      background: rgba(239, 68, 68, 0.1);
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: #a1a1aa;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top: 3px solid #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .favorites-container {
        padding: 1rem;
      }

      .favorites-title {
        font-size: 2rem;
      }

      .song-item {
        padding: 0.5rem;
      }

      .song-cover {
        width: 40px;
        height: 40px;
      }
    }
  `]
})
export class FavoritesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private favoritesService = inject(FavoritesService);
  private audioPlayerService = inject(AudioPlayerService);
  private authStateService = inject(AuthStateService);
  private router = inject(Router);

  favorites: FavoriteSong[] = [];
  isLoading = true;

  ngOnInit() {
    // Verificar autenticación
    this.authStateService.user$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (!user) {
        this.router.navigate(['/auth']);
        return;
      }
      this.loadFavorites();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFavorites() {
    this.favoritesService.favorites$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(favorites => {
      this.favorites = favorites;
      this.isLoading = false;
    });
  }

  playSong(song: FavoriteSong, index: number) {
    const audioData = {
      id: song.song_id,
      title: song.song_title,
      artist: song.song_artist,
      duration: song.song_duration || 0,
      cover: song.song_cover_url || '/assets/default-cover.jpg',
      url: `https://api.music-service.com/stream/${song.song_id}` // Ajusta según tu servicio
    };

    // Crear playlist temporal con favoritos
    const playlist = this.favorites.map(fav => ({
      id: fav.song_id,
      title: fav.song_title,
      artist: fav.song_artist,
      duration: fav.song_duration || 0,
      cover: fav.song_cover_url || '/assets/default-cover.jpg',
      url: `https://api.music-service.com/stream/${fav.song_id}`
    }));

    this.audioPlayerService.playTrack(audioData, playlist, index);
  }

  async removeFavorite(event: Event, songId: string) {
    event.stopPropagation();
    
    const result = await this.favoritesService.removeFromFavorites(songId);
    if (!result.success) {
      console.error('Error al quitar de favoritos:', result.error);
      // Aquí podrías mostrar un toast o mensaje de error
    }
  }

  isCurrentSong(songId: string): boolean {
    return this.audioPlayerService.getCurrentTrack()?.id === songId;
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  onImageError(event: any) {
    event.target.src = '/assets/default-cover.jpg';
  }

  navigateToDiscover() {
    this.router.navigate(['/discover']);
  }
}