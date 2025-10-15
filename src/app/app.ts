import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { songs } from './data/songs';
import { Song } from './models/song';
import { SongCardComponent } from './song-card.component';
import { PlayerComponent } from './player.component';
import { HeaderComponent } from './header.component';
import { HeroComponent } from './hero.component';
import { StickySectionComponent } from './sticky-section.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SongCardComponent, PlayerComponent, HeaderComponent, HeroComponent, StickySectionComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  songs: Song[] = songs;

  // Signals para mejor reactividad
  currentSong = signal<Song | null>(null);
  currentIndex = signal(0);
  isPlaying = signal(false);
  progress = signal(0);
  currentTime = signal(0);
  duration = signal(0);

  // Computed para formatear tiempo
  formattedCurrentTime = computed(() => this.formatTime(this.currentTime()));
  formattedDuration = computed(() => this.formatTime(this.duration()));

  private audio: HTMLAudioElement | null = null;
  private progressInterval: any = null;
  private isBrowser = false;

  ngOnInit() {
    // Verificar si estamos en el navegador
    this.isBrowser = typeof window !== 'undefined' && typeof Audio !== 'undefined';
    
    if (this.isBrowser) {
      this.initializeAudio();
    }
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private initializeAudio() {
    if (!this.isBrowser) return;

    this.audio = new Audio();
    
    // Eventos del reproductor
    this.audio.addEventListener('loadedmetadata', () => {
      this.duration.set(this.audio?.duration || 180);
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.currentTime.set(this.audio.currentTime);
        const dur = this.duration();
        if (dur > 0) {
          this.progress.set((this.currentTime() / dur) * 100);
        }
      }
    });

    this.audio.addEventListener('ended', () => {
      this.next();
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying.set(true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying.set(false);
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio error:', e);
      this.isPlaying.set(false);
    });
  }

  playSong(song: Song) {
    if (!this.isBrowser) return;

    const previousSong = this.currentSong();
    this.currentSong.set(song);

    // Simular URL de audio (en producción, usa URLs reales)
    const audioUrl = this.getAudioUrl(song);
    
    if (this.audio) {
      if (previousSong?.id !== song.id) {
        this.audio.src = audioUrl;
        this.audio.load();
      }
      
      this.audio.play()
        .then(() => {
          this.isPlaying.set(true);
          this.startProgressSimulation();
        })
        .catch(err => {
          console.warn('Playback failed:', err);
          // Simular reproducción para demo
          this.simulatePlayback();
        });
    } else {
      // Fallback: simular reproducción
      this.simulatePlayback();
    }
  }

  private getAudioUrl(song: Song): string {
    // En producción, retorna la URL real del audio
    // Por ahora, retornamos un archivo de audio de ejemplo o silencio
    // Puedes usar: https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3
    return 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  }

  private simulatePlayback() {
    // Simular reproducción para demo UI
    this.isPlaying.set(true);
    this.currentTime.set(0);
    this.duration.set(180); // 3 minutos
    this.startProgressSimulation();
  }

  private startProgressSimulation() {
    this.stopProgressSimulation();
    
    // Simular progreso si el audio real no está disponible
    if (!this.audio || !this.audio.src || this.audio.src.startsWith('data:')) {
      this.progressInterval = setInterval(() => {
        if (this.isPlaying()) {
          const newTime = this.currentTime() + 0.1;
          if (newTime >= this.duration()) {
            this.currentTime.set(0);
            this.next();
          } else {
            this.currentTime.set(newTime);
            this.progress.set((newTime / this.duration()) * 100);
          }
        }
      }, 100);
    }
  }

  private stopProgressSimulation() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  togglePlay() {
    if (!this.currentSong()) {
      // Si no hay canción, reproducir la primera
      this.playSong(this.songs[0]);
      this.currentIndex.set(0);
      return;
    }

    if (this.audio && this.audio.src && !this.audio.src.startsWith('data:')) {
      if (this.isPlaying()) {
        this.audio.pause();
      } else {
        this.audio.play().catch(() => this.simulatePlayback());
      }
    } else {
      // Toggle simulado
      this.isPlaying.update(val => !val);
      if (this.isPlaying()) {
        this.startProgressSimulation();
      } else {
        this.stopProgressSimulation();
      }
    }
  }

  onPlay(song: Song) {
    if (this.currentSong()?.id === song.id) {
      this.togglePlay();
    } else {
      const index = this.songs.findIndex(s => s.id === song.id);
      this.currentIndex.set(index >= 0 ? index : 0);
      this.playSong(song);
    }
  }

  next() {
    const nextIndex = (this.currentIndex() + 1) % this.songs.length;
    this.currentIndex.set(nextIndex);
    this.playSong(this.songs[nextIndex]);
  }

  previous() {
    const prevIndex = (this.currentIndex() - 1 + this.songs.length) % this.songs.length;
    this.currentIndex.set(prevIndex);
    this.playSong(this.songs[prevIndex]);
  }

  seek(percent: number) {
    const newTime = (percent / 100) * this.duration();
    this.currentTime.set(newTime);
    this.progress.set(percent);
    
    if (this.audio && this.audio.src && !this.audio.src.startsWith('data:')) {
      this.audio.currentTime = newTime;
    }
  }

  formatTime(sec: number): string {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  trackByTitle(index: number, item: Song) {
    return item.title;
  }
  private cleanup() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio.load();
      this.audio = null;
    }
    this.stopProgressSimulation();
  }
}