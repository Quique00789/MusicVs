import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AddToPlaylistModalComponent } from './components/add-to-playlist-modal.component';
// importación Song si tienes models/song.ts
// import { Song } from './models/song';

interface DiscoverItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  type: 'song' | 'artist' | 'playlist' | 'genre';
  duration?: string;
  plays?: string;
}

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [CommonModule, FormsModule, AddToPlaylistModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="discover-container">
      <!-- Hero Section -->
      <div class="discover-hero">
        <div class="hero-content">
          <h1 class="hero-title fade-in-up">Discover</h1>
          <p class="hero-subtitle fade-in-up">Explora nueva música y encuentra tus próximos favoritos</p>
          <!-- Search Bar con Glasmorphism -->
          <div class="search-container fade-in-up">
            <div class="search-box glass-morphism">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input 
                type="text" 
                placeholder="Buscar canciones, artistas, álbumes..." 
                class="search-input"
                [(ngModel)]="searchQuery" 
                (input)="onSearchChange()"
              >
              <button *ngIf="searchQuery" class="clear-btn" (click)="clearSearch()">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <!-- Floating Elements -->
        <div class="floating-elements">
          <div class="floating-circle circle-1"></div>
          <div class="floating-circle circle-2"></div>
          <div class="floating-circle circle-3"></div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="discover-content">
        <!-- Search Results Section -->
        <section class="content-section fade-in-up" *ngIf="searchQuery && filteredSongs.length > 0">
          <div class="section-header">
            <h2 class="section-title">Resultados de Búsqueda</h2>
            <span class="results-count glass-morphism">{{ filteredSongs.length }} resultado{{ filteredSongs.length !== 1 ? 's' : '' }}</span>
          </div>
          <div class="search-results-grid">
            <div 
              *ngFor="let song of filteredSongs; let i = index" 
              class="search-result-item glass-morphism fade-in-up"
              [style.animation-delay.s]="i * 0.1"
            >
              <div class="result-image">
                <img [src]="song.image" [alt]="song.title" loading="lazy">
                <div class="play-overlay">
                  <button class="play-btn neomorphism">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="result-info">
                <h3 class="result-title">{{ song.title }}</h3>
                <p class="result-artist">{{ song.subtitle }}</p>
                <div class="result-meta">
                  <span class="result-duration">{{ song.duration }}</span>
                </div>
              </div>
              <button class="add-btn neomorphism" title="Agregar a playlist" (click)="openAddToPlaylistModal(song)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </button>
            </div>
          </div>
        </section>
        <!-- No Results Message -->
        <section class="content-section fade-in-up" *ngIf="searchQuery && filteredSongs.length === 0">
          <div class="no-results glass-morphism">
            <svg class="no-results-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3 class="no-results-title">No se encontraron resultados</h3>
            <p class="no-results-text">No encontramos canciones que coincidan con "{{ searchQuery }}"</p>
            <button class="clear-search-btn neomorphism" (click)="clearSearch()">
              <span>Limpiar búsqueda</span>
            </button>
          </div>
        </section>
        <!-- Otros sections de la plantilla van igual... -->
        <!-- ... playlist, trending, genres, artists, releases ... -->
      </div>
    </div>
    <app-add-to-playlist-modal
      [isOpen]="showAddToPlaylistModal"
      [song]="selectedSong"
      (closed)="closeAddToPlaylistModal()"
      (added)="onSongAdded($event)">
    </app-add-to-playlist-modal>
    <div class="success-toast" *ngIf="showSuccessToast">
      <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span>Agregada a {{ addedToPlaylistName }}</span>
    </div>
  `,
  styles: [`
    /* ...se dejan los mismos estilos... */
    .add-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      color: #06b6d4;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      flex-shrink: 0;
      margin-left: 1rem;
    }
    .add-btn:hover {
      transform: scale(1.1);
      color: #0891b2;
    }
    .add-btn svg {
      width: 20px;
      height: 20px;
    }
    .success-toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: rgba(34, 197, 94, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      color: white;
      font-weight: 500;
      box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3);
      z-index: 1001;
      animation: slideInUp 0.3s ease;
    }
    @keyframes slideInUp {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .success-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
  `]
})
export class DiscoverComponent implements OnInit {
  trendingSongs: DiscoverItem[] = [
    {
      id: '1',
      title: 'As It Was',
      subtitle: 'Harry Styles',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      type: 'song', duration: '2:47', plays: '1.2B'
    },
    {
      id: '2', title: 'Heat Waves', subtitle: 'Glass Animals', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop', type: 'song', duration: '3:58', plays: '890M' },
    {
      id: '3', title: 'About Damn Time', subtitle: 'Lizzo', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop', type: 'song', duration: '3:13', plays: '760M' },
    {
      id: '4', title: 'Bad Habit', subtitle: 'Steve Lacy', image: 'https://images.unsplash.com/photo-1571974599782-87624638275c?w=300&h=300&fit=crop', type: 'song', duration: '3:51', plays: '650M' }
  ];
  genres: DiscoverItem[] = [...]; // igual que antes
  playlists: DiscoverItem[] = [...]; // igual que antes
  artists: DiscoverItem[] = [...]; // igual que antes
  newReleases: DiscoverItem[] = [...]; // igual que antes
  searchQuery: string = '';
  filteredSongs: DiscoverItem[] = [];
  showAddToPlaylistModal = false;
  selectedSong: DiscoverItem | null = null;
  showSuccessToast = false;
  addedToPlaylistName = '';
  constructor(private router: Router, private cdr: ChangeDetectorRef) {}
  ngOnInit() {}
  onSearchChange() {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.filteredSongs = this.trendingSongs.filter(song =>
        song.title.toLowerCase().includes(query) ||
        song.subtitle.toLowerCase().includes(query)
      );
    } else {
      this.filteredSongs = [];
    }
    this.cdr?.markForCheck();
  }
  clearSearch() {
    this.searchQuery = '';
    this.filteredSongs = [];
    this.cdr?.markForCheck();
  }
  openAddToPlaylistModal(song: DiscoverItem) {
    this.selectedSong = song;
    this.showAddToPlaylistModal = true;
    this.cdr?.markForCheck();
  }
  closeAddToPlaylistModal() {
    this.showAddToPlaylistModal = false;
    this.selectedSong = null;
    this.cdr?.markForCheck();
  }
  onSongAdded(event: { playlistId: string; playlistName: string }) {
    this.addedToPlaylistName = event.playlistName;
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
      this.cdr?.markForCheck();
    }, 3000);
    this.cdr?.markForCheck();
  }
  trackByFn(index: number, item: DiscoverItem): string {
    return item.id;
  }
}
