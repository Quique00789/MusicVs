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
  styles: [`
    .discover-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
      color: #e6eefc;
      position: relative;
    }

    /* Hero Section */
    .discover-hero {
      height: 60vh;
      min-height: 400px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, 
        rgba(6, 182, 212, 0.1) 0%, 
        rgba(59, 130, 246, 0.08) 50%, 
        rgba(139, 92, 246, 0.1) 100%
      );
      overflow: hidden;
    }

    .hero-content {
      text-align: center;
      z-index: 2;
      max-width: 600px;
      padding: 0 2rem;
    }

    .hero-title {
      font-size: 4rem;
      font-weight: 800;
      background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1rem;
      text-shadow: 0 0 30px rgba(6, 182, 212, 0.3);
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: rgba(230, 238, 252, 0.8);
      margin-bottom: 2rem;
      font-weight: 300;
    }

    /* Search Bar con Glasmorphism */
    .search-container {
      max-width: 500px;
      margin: 0 auto;
    }

    .search-box {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      border-radius: 50px;
      position: relative;
    }

    .search-icon {
      width: 20px;
      height: 20px;
      color: rgba(230, 238, 252, 0.6);
      margin-right: 1rem;
    }

    .search-input {
      flex: 1;
      background: none;
      border: none;
      color: #e6eefc;
      font-size: 1rem;
      outline: none;
    }

    .search-input::placeholder {
      color: rgba(230, 238, 252, 0.5);
    }

    /* Floating Elements */
    .floating-elements {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .floating-circle {
      position: absolute;
      border-radius: 50%;
      background: linear-gradient(135deg, 
        rgba(6, 182, 212, 0.1), 
        rgba(59, 130, 246, 0.1)
      );
      backdrop-filter: blur(1px);
      animation: float 6s ease-in-out infinite;
    }

    .circle-1 {
      width: 100px;
      height: 100px;
      top: 20%;
      left: 10%;
      animation-delay: 0s;
    }

    .circle-2 {
      width: 60px;
      height: 60px;
      top: 60%;
      right: 15%;
      animation-delay: 2s;
    }

    .circle-3 {
      width: 80px;
      height: 80px;
      bottom: 20%;
      left: 20%;
      animation-delay: 4s;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-20px) rotate(180deg);
      }
    }

    /* Content Sections */
    .discover-content {
      padding: 3rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .content-section {
      margin-bottom: 4rem;
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

    .see-all-btn {
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      border: none;
      color: #e6eefc;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .see-all-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(6, 182, 212, 0.3);
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

    /* Trending Section */
    .trending-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .trending-item {
      display: flex;
      align-items: center;
      padding: 1.5rem;
      border-radius: 20px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .trending-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(6, 182, 212, 0.2);
    }

    .trending-rank {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      margin-right: 1rem;
      font-weight: 700;
      color: #06b6d4;
    }

    .trending-image {
      width: 80px;
      height: 80px;
      border-radius: 15px;
      overflow: hidden;
      position: relative;
      margin-right: 1.5rem;
    }

    .trending-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .play-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.3s ease;
    }

    .trending-item:hover .play-overlay,
    .playlist-card:hover .playlist-overlay,
    .release-card:hover .release-overlay {
      opacity: 1;
    }

    .play-btn {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      border: none;
      color: #06b6d4;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .play-btn svg {
      width: 20px;
      height: 20px;
      margin-left: 2px;
    }

    .play-btn:hover {
      transform: scale(1.1);
      color: #0891b2;
    }

    .trending-info {
      flex: 1;
    }

    .trending-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #e6eefc;
    }

    .trending-artist {
      color: rgba(230, 238, 252, 0.7);
      margin-bottom: 0.5rem;
    }

    .trending-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: rgba(230, 238, 252, 0.6);
    }

    /* Genres Section */
    .genres-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .genre-card {
      height: 120px;
      border-radius: 20px;
      overflow: hidden;
      position: relative;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .genre-card:hover {
      transform: translateY(-5px) scale(1.02);
    }

    .genre-bg {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
    }

    .genre-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, 
        rgba(6, 182, 212, 0.7), 
        rgba(139, 92, 246, 0.7)
      );
    }

    .genre-content {
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      z-index: 2;
    }

    .genre-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    /* Playlists Section */
    .playlists-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
    }

    .playlist-card {
      padding: 1.5rem;
      border-radius: 20px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .playlist-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(6, 182, 212, 0.25);
    }

    .playlist-image {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 15px;
      overflow: hidden;
      position: relative;
      margin-bottom: 1rem;
    }

    .playlist-image img {
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

    .playlist-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #e6eefc;
    }

    .playlist-description {
      color: rgba(230, 238, 252, 0.7);
      font-size: 0.9rem;
      line-height: 1.4;
    }

    /* Artists Section */
    .artists-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .artist-card {
      padding: 1.5rem;
      border-radius: 20px;
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .artist-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(139, 92, 246, 0.25);
    }

    .artist-image {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      margin: 0 auto 1rem;
      position: relative;
    }

    .artist-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .verified-badge {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #06b6d4, #0891b2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid #0f0f0f;
    }

    .verified-badge svg {
      width: 16px;
      height: 16px;
      color: white;
    }

    .artist-name {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #e6eefc;
    }

    .artist-followers {
      color: rgba(230, 238, 252, 0.7);
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .follow-btn {
      padding: 0.6rem 1.5rem;
      border-radius: 20px;
      border: none;
      color: #e6eefc;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .follow-btn:hover {
      transform: scale(1.05);
      background: linear-gradient(145deg, #06b6d4, #0891b2);
    }

    /* New Releases Section */
    .releases-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1.5rem;
    }

    .release-card {
      padding: 1rem;
      border-radius: 15px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .release-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(6, 182, 212, 0.2);
    }

    .release-image {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
      margin-bottom: 1rem;
    }

    .release-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .new-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 0.3rem 0.6rem;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 700;
      color: #06b6d4;
    }

    .release-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.3s ease;
    }

    .release-title {
      font-size: 0.95rem;
      font-weight: 600;
      margin-bottom: 0.3rem;
      color: #e6eefc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .release-artist {
      color: rgba(230, 238, 252, 0.7);
      font-size: 0.85rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .discover-content {
        padding: 2rem 1rem;
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .section-title {
        font-size: 1.5rem;
      }

      .section-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .trending-grid {
        grid-template-columns: 1fr;
      }

      .trending-item {
        padding: 1rem;
      }

      .trending-image {
        width: 60px;
        height: 60px;
        margin-right: 1rem;
      }

      .genres-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .genre-card {
        height: 100px;
      }
    }

    @media (max-width: 480px) {
      .discover-hero {
        height: 50vh;
      }

      .hero-content {
        padding: 0 1rem;
      }

      .search-box {
        padding: 0.8rem 1rem;
      }

      .releases-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 1rem;
      }

      .artists-grid {
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      }

      .playlists-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
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
      type: 'song',
      duration: '2:47',
      plays: '1.2B'
    },
    {
      id: '2',
      title: 'Heat Waves',
      subtitle: 'Glass Animals',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
      type: 'song',
      duration: '3:58',
      plays: '890M'
    },
    {
      id: '3',
      title: 'About Damn Time',
      subtitle: 'Lizzo',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop',
      type: 'song',
      duration: '3:13',
      plays: '760M'
    },
    {
      id: '4',
      title: 'Bad Habit',
      subtitle: 'Steve Lacy',
      image: 'https://images.unsplash.com/photo-1571974599782-87624638275c?w=300&h=300&fit=crop',
      type: 'song',
      duration: '3:51',
      plays: '650M'
    }
  ];

  genres: DiscoverItem[] = [
    {
      id: '1',
      title: 'Pop',
      subtitle: '',
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop',
      type: 'genre'
    },
    {
      id: '2',
      title: 'Hip Hop',
      subtitle: '',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      type: 'genre'
    },
    {
      id: '3',
      title: 'Rock',
      subtitle: '',
      image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=300&fit=crop',
      type: 'genre'
    },
    {
      id: '4',
      title: 'Electronic',
      subtitle: '',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      type: 'genre'
    },
    {
      id: '5',
      title: 'Jazz',
      subtitle: '',
      image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=300&fit=crop',
      type: 'genre'
    },
    {
      id: '6',
      title: 'Classical',
      subtitle: '',
      image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=300&fit=crop',
      type: 'genre'
    }
  ];

  playlists: DiscoverItem[] = [
    {
      id: '1',
      title: 'Chill Vibes',
      subtitle: 'Música relajante para cualquier momento',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
      type: 'playlist'
    },
    {
      id: '2',
      title: 'Workout Hits',
      subtitle: 'Energía para tu entrenamiento',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
      type: 'playlist'
    },
    {
      id: '3',
      title: 'Late Night Drive',
      subtitle: 'Perfecta para conducir de noche',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      type: 'playlist'
    },
    {
      id: '4',
      title: 'Focus Mode',
      subtitle: 'Concentración y productividad',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
      type: 'playlist'
    }
  ];

  artists: DiscoverItem[] = [
    {
      id: '1',
      title: 'The Weeknd',
      subtitle: '85.2M seguidores',
      image: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=300&h=300&fit=crop&crop=face',
      type: 'artist'
    },
    {
      id: '2',
      title: 'Billie Eilish',
      subtitle: '72.8M seguidores',
      image: 'https://images.unsplash.com/photo-1494790108755-2616c667c620?w=300&h=300&fit=crop&crop=face',
      type: 'artist'
    },
    {
      id: '3',
      title: 'Ed Sheeran',
      subtitle: '68.5M seguidores',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      type: 'artist'
    },
    {
      id: '4',
      title: 'Dua Lipa',
      subtitle: '55.3M seguidores',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      type: 'artist'
    },
    {
      id: '5',
      title: 'Post Malone',
      subtitle: '47.9M seguidores',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      type: 'artist'
    }
  ];

  newReleases: DiscoverItem[] = [
    {
      id: '1',
      title: 'Midnight Rain',
      subtitle: 'Taylor Swift',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      type: 'song'
    },
    {
      id: '2',
      title: 'Flowers',
      subtitle: 'Miley Cyrus',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
      type: 'song'
    },
    {
      id: '3',
      title: 'Escapism',
      subtitle: 'RAYE ft. 070 Shake',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop',
      type: 'song'
    },
    {
      id: '4',
      title: 'Creepin',
      subtitle: 'Metro Boomin',
      image: 'https://images.unsplash.com/photo-1571974599782-87624638275c?w=300&h=300&fit=crop',
      type: 'song'
    },
    {
      id: '5',
      title: 'Vampire',
      subtitle: 'Olivia Rodrigo',
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=300&h=300&fit=crop',
      type: 'song'
    },
    {
      id: '6',
      title: 'Seven',
      subtitle: 'Jung Kook',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
      type: 'song'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Cargar datos o inicializar componente
  }

  trackByFn(index: number, item: DiscoverItem): string {
    return item.id;
  }
}