import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SmoothScrollService } from './services/smooth-scroll.service';

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
          <div class="search-container fade-in-up">
            <div class="search-box glass-morphism">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input type="text" placeholder="Buscar canciones, artistas, álbumes..." class="search-input">
            </div>
          </div>
        </div>
        <div class="floating-elements">
          <div class="floating-circle circle-1"></div>
          <div class="floating-circle circle-2"></div>
          <div class="floating-circle circle-3"></div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="discover-content" #contentRoot>
        <section class="content-section fade-in-up">
          <div class="section-header">
            <h2 class="section-title">Tendencias Ahora</h2>
            <button class="see-all-btn glass-morphism">Ver todo</button>
          </div>
          <div class="trending-grid">
            <div *ngFor="let song of trendingSongs; trackBy: trackByFn; let i = index" 
                 class="trending-item glass-morphism fade-in-up"
                 [style.animation-delay.s]="i * 0.1">
              <div class="trending-rank neomorphism"><span>{{ i + 1 }}</span></div>
              <div class="trending-image">
                <img [src]="song.image" [alt]="song.title" loading="lazy">
                <div class="play-overlay">
                  <button class="play-btn neomorphism">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
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

        <!-- Resto de secciones iguales -->
        <section class="content-section fade-in-up">
          <div class="section-header">
            <h2 class="section-title">Géneros Populares</h2>
          </div>
          <div class="genres-grid">
            <div *ngFor="let genre of genres; trackBy: trackByFn; let i = index" 
                 class="genre-card glass-morphism fade-in-up"
                 [style.animation-delay.s]="i * 0.15">
              <div class="genre-bg" [style.background-image]="'url(' + genre.image + ')'">
                <div class="genre-overlay"></div>
              </div>
              <div class="genre-content">
                <h3 class="genre-title">{{ genre.title }}</h3>
              </div>
            </div>
          </div>
        </section>

        <section class="content-section fade-in-up">
          <div class="section-header">
            <h2 class="section-title">Playlists Recomendadas</h2>
            <button class="see-all-btn glass-morphism">Ver todo</button>
          </div>
          <div class="playlists-grid">
            <div *ngFor="let playlist of playlists; trackBy: trackByFn; let i = index" 
                 class="playlist-card glass-morphism fade-in-up"
                 [style.animation-delay.s]="i * 0.1">
              <div class="playlist-image">
                <img [src]="playlist.image" [alt]="playlist.title" loading="lazy">
                <div class="playlist-overlay">
                  <button class="play-btn neomorphism">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
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

        <section class="content-section fade-in-up">
          <div class="section-header">
            <h2 class="section-title">Artistas Destacados</h2>
            <button class="see-all-btn glass-morphism">Ver todo</button>
          </div>
          <div class="artists-grid">
            <div *ngFor="let artist of artists; trackBy: trackByFn; let i = index" 
                 class="artist-card glass-morphism fade-in-up"
                 [style.animation-delay.s]="i * 0.12">
              <div class="artist-image">
                <img [src]="artist.image" [alt]="artist.title" loading="lazy">
                <div class="verified-badge" *ngIf="i < 3">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
              </div>
              <div class="artist-info">
                <h3 class="artist-name">{{ artist.title }}</h3>
                <p class="artist-followers">{{ artist.subtitle }}</p>
                <button class="follow-btn neomorphism"><span>Seguir</span></button>
              </div>
            </div>
          </div>
        </section>

        <section class="content-section fade-in-up">
          <div class="section-header">
            <h2 class="section-title">Nuevos Lanzamientos</h2>
            <button class="see-all-btn glass-morphism">Ver todo</button>
          </div>
          <div class="releases-grid">
            <div *ngFor="let release of newReleases; trackBy: trackByFn; let i = index" 
                 class="release-card glass-morphism fade-in-up"
                 [style.animation-delay.s]="i * 0.08">
              <div class="release-image">
                <img [src]="release.image" [alt]="release.title" loading="lazy">
                <div class="new-badge neomorphism"><span>NUEVO</span></div>
                <div class="release-overlay">
                  <button class="play-btn neomorphism"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>
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
  styles: [`
    .discover-container { min-height: 100vh; background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%); color: #e6eefc; position: relative; }
    /* Evitar scroll en contenedor y dejarlo al documento */
    :host { display:block; }
  `]
})
export class DiscoverComponent implements OnInit, AfterViewInit, OnDestroy {
  trendingSongs: DiscoverItem[] = [/* ...igual... */];
  genres: DiscoverItem[] = [/* ...igual... */];
  playlists: DiscoverItem[] = [/* ...igual... */];
  artists: DiscoverItem[] = [/* ...igual... */];
  newReleases: DiscoverItem[] = [/* ...igual... */];

  constructor(private router: Router, private smooth: SmoothScrollService) {}

  ngOnInit() {
    // Asegurar inicialización (idempotente)
    void this.smooth.initialize();
  }

  ngAfterViewInit() {
    // Tras render, refrescar triggers para evitar saltos
    this.smooth.refresh();
  }

  ngOnDestroy() {}

  trackByFn(index: number, item: DiscoverItem): string { return item.id; }
}
