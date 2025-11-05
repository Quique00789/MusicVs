import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Song } from './models/song';
import { FavoriteButtonComponent } from './favorite-button.component';
import { FavoritesService } from './services/favorites.service';

@Component({
  selector: 'song-card',
  standalone: true,
  imports: [CommonModule, FavoriteButtonComponent],
  template: `
    <div class="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/5 hover:border-cyan-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20" data-aos="fade-up" data-aos-duration="800">
      <div class="relative aspect-square overflow-hidden">
        <img [src]="song.cover" alt="{{ song.title }}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <button (click)="play.emit(song)" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300" [ngClass]="isPlaying ? 'bg-cyan-500 scale-100' : 'bg-gradient-to-r from-cyan-400 to-blue-600 scale-0 group-hover:scale-100'">
          <span class="text-white font-bold">▶</span>
        </button>

        <div class="absolute top-4 right-4">
          <app-favorite-button
            [song]="{ id: song.id, title: song.title, artist: song.artist, duration: song.durationSeconds || 0, cover: song.cover }"
            size="small"
            (favoriteChanged)="onFavoriteChanged($event)"
          />
        </div>
      </div>

      <div class="p-5">
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1 min-w-0">
            <h3 class="text-white font-semibold text-lg truncate mb-1 group-hover:text-cyan-400 transition-colors">{{ song.title }}</h3>
            <p class="text-gray-400 text-sm truncate">{{ song.artist }}</p>
          </div>
          <button class="p-2 hover:bg-white/6 rounded-full transition-colors">⋯</button>
        </div>

        <div class="flex items-center justify-between text-xs text-gray-500 mt-3">
          <span>{{ song.album || '' }}</span>
          <span>{{ song.duration || '' }}</span>
        </div>
      </div>
    </div>
  `
})
export class SongCardComponent {
  @Input() song!: Song;
  @Input() isPlaying = false;
  @Output() play = new EventEmitter<Song>();

  private favorites = inject(FavoritesService);

  onFavoriteChanged(_e: { isFavorite: boolean; success: boolean }) {
    // Carga perezosa de la lista si se requiere, nada crítico aquí.
    // El servicio ya actualiza el estado global de favoritos.
    if (!_e.success) {
      console.error('No se pudo actualizar favorito');
    }
  }
}
