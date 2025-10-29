import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
  imports: [CommonModule],
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
              <input type="text" placeholder="Buscar canciones, artistas, álbumes..." class="search-input">
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
        
        <!-- Trending Now Section -->
        <section class="content-section fade-in-up">
          <div class="section-header">
            <h2 class="section-title">Tendencias Ahora</h2>
            <button class="see-all-btn glass-morphism">Ver todo</button>
          </div>
          <div class="trending-grid">
            <div 
              *ngFor="let song of trendingSongs; trackBy: trackByFn; let i = index" 
              class="trending-item glass-morphism fade-in-up"
              [style.animation-delay.s]="i * 0.1"
            >
              <div class="trending-rank neomorphism">
                <span>{{ i + 1 }}</span>
              </div>
              <div class="trending-image">
                <img [src]="song.image" [alt]="song.title" loading="lazy">
                <div class="play-overlay">
                  <button class="play-btn neomorphism">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="trending-info">
                <h3 class="trending-title">{{ song.title }}</h3>
                <p class="trending-artist">{{ song.subtitle }}</p>
                <div class="trending-stats">
                  <span class="plays">{{ song.plays }} reproducciones</span>
                  <span class="duration">{{ song.duration }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Genres Section -->
        <section class="content-section fade-in-up">
          <div class="section-header">
            <h2 class="section-title">Géneros Populares</h2>
          </div>
          <div class="genres-grid">
            <div 
              *ngFor="let genre of genres; trackBy: trackByFn; let i = index" 
              class="genre-card glass-morphism fade-in-up"
              [style.animation-delay.s]="i * 0.15"
            >
              <div class="genre-bg" [style.background-image]="'url(' + genre.image + ')'">
                <div class="genre-overlay"></div>
              </div>
              <div class="genre-content">
                <h3 class="genre-title">{{ genre.title }}</h3>
              </div>
            </div>
          </div>
        </section>

        <!-- Recommended Playlists -->
        <section class="content-section fade-in-up">
          <div class="section-header">
            <h2 class="section-title">Playlists Recomendadas</h2>
            <button class="see-all-btn glass-morphism">Ver todo</button>
          </div>
          <div class="playlists-grid">
            <div 
              *ngFor="let playlist of playlists; trackBy: trackByFn; let i = index" 
              class="playlist-card glass-morphism fade-in-up"
              [style.animation-delay.s]="i * 0.1"
            >
              <div class="playlist-image">
                <img [src]="playlist.image" [alt]="playlist.title" loading="lazy">
                <div class="playlist-overlay">
                  <button class="play-btn neomorphism">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="playlist-info">
                <h3 class="playlist-title">{{ playlist.title }}</h3>
                <p class="playlist-description">{{ playlist.subtitle }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Featured Artists -->
        <section class="content-section fade-in-up">
          <div class="section-header">
            <h2 class="section-title">Artistas Destacados</h2>
            <button class="see-all-btn glass-morphism">Ver todo</button>
          </div>
          <div class="artists-grid">
            <div 
              *ngFor="let artist of artists; trackBy: trackByFn; let i = index" 
              class="artist-card glass-morphism fade-in-up"
              [style.animation-delay.s]="i * 0.12"
            >
              <div class="artist-image">
                <img [src]="artist.image" [alt]="artist.title" loading="lazy">
                <div class="verified-badge" *ngIf="i < 3">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div class="artist-info">
                <h3 class="artist-name">{{ artist.title }}</h3>
                <p class="artist-followers">{{ artist.subtitle }}</p>
                <button class="follow-btn neomorphism">
                  <span>Seguir</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- New Releases -->
        <section class="content-section fade-in-up">
          <div class="section-header">
            <h2 class="section-title">Nuevos Lanzamientos</h2>
            <button class="see-all-btn glass-morphism">Ver todo</button>
          </div>
          <div class="releases-grid">
            <div 
              *ngFor="let release of newReleases; trackBy: trackByFn; let i = index" 
              class="release-card glass-morphism fade-in-up"
              [style.animation-delay.s]="i * 0.08"
            >
              <div class="release-image">
                <img [src]="release.image" [alt]="release.title" loading="lazy">
                <div class="new-badge neomorphism">
                  <span>NUEVO</span>
                </div>
                <div class="release-overlay">
                  <button class="play-btn neomorphism">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="release-info">
                <h3 class="release-title">{{ release.title }}</h3>
                <p class="release-artist">{{ release.subtitle }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`/* estilos completos como en el commit anterior restaurado */`]
})
export class DiscoverComponent implements OnInit {
  trendingSongs: DiscoverItem[] = [
    { id: '1', title: 'As It Was', subtitle: 'Harry Styles', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', type: 'song', duration: '2:47', plays: '1.2B' },
    { id: '2', title: 'Heat Waves', subtitle: 'Glass Animals', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop', type: 'song', duration: '3:58', plays: '890M' },
    { id: '3', title: 'About Damn Time', subtitle: 'Lizzo', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop', type: 'song', duration: '3:13', plays: '760M' },
    { id: '4', title: 'Bad Habit', subtitle: 'Steve Lacy', image: 'https://images.unsplash.com/photo-1571974599782-87624638275c?w=300&h=300&fit=crop', type: 'song', duration: '3:51', plays: '650M' }
  ];
  genres: DiscoverItem[] = [
    { id: '1', title: 'Pop', subtitle: '', image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop', type: 'genre' },
    { id: '2', title: 'Hip Hop', subtitle: '', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', type: 'genre' },
    { id: '3', title: 'Rock', subtitle: '', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=300&fit=crop', type: 'genre' },
    { id: '4', title: 'Electronic', subtitle: '', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', type: 'genre' },
    { id: '5', title: 'Jazz', subtitle: '', image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=300&fit=crop', type: 'genre' },
    { id: '6', title: 'Classical', subtitle: '', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=300&fit=crop', type: 'genre' }
  ];
  playlists: DiscoverItem[] = [
    { id: '1', title: 'Chill Vibes', subtitle: 'Música relajante para cualquier momento', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop', type: 'playlist' },
    { id: '2', title: 'Workout Hits', subtitle: 'Energía para tu entrenamiento', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', type: 'playlist' },
    { id: '3', title: 'Late Night Drive', subtitle: 'Perfecta para conducir de noche', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', type: 'playlist' },
    { id: '4', title: 'Focus Mode', subtitle: 'Concentración y productividad', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop', type: 'playlist' }
  ];
  artists: DiscoverItem[] = [
    { id: '1', title: 'The Weeknd', subtitle: '85.2M seguidores', image: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=300&h=300&fit=crop&crop=face', type: 'artist' },
    { id: '2', title: 'Billie Eilish', subtitle: '72.8M seguidores', image: 'https://images.unsplash.com/photo-1494790108755-2616c667c620?w=300&h=300&fit=crop&crop=face', type: 'artist' },
    { id: '3', title: 'Ed Sheeran', subtitle: '68.5M seguidores', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face', type: 'artist' },
    { id: '4', title: 'Dua Lipa', subtitle: '55.3M seguidores', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face', type: 'artist' },
    { id: '5', title: 'Post Malone', subtitle: '47.9M seguidores', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face', type: 'artist' }
  ];
  newReleases: DiscoverItem[] = [
    { id: '1', title: 'Midnight Rain', subtitle: 'Taylor Swift', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', type: 'song' },
    { id: '2', title: 'Flowers', subtitle: 'Miley Cyrus', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop', type: 'song' },
    { id: '3', title: 'Escapism', subtitle: 'RAYE ft. 070 Shake', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop', type: 'song' },
    { id: '4', title: 'Creepin', subtitle: 'Metro Boomin', image: 'https://images.unsplash.com/photo-1571974599782-87624638275c?w=300&h=300&fit=crop', type: 'song' },
    { id: '5', title: 'Vampire', subtitle: 'Olivia Rodrigo', image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=300&h=300&fit=crop', type: 'song' },
    { id: '6', title: 'Seven', subtitle: 'Jung Kook', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', type: 'song' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  trackByFn(index: number, item: DiscoverItem): string { return item.id; }
}
