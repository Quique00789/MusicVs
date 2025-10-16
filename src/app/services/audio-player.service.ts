// src/app/services/audio-player.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { Song } from '../models/song';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {
  // Signals para estado reactivo
  currentSong = signal<Song | null>(null);
  currentIndex = signal(0);
  isPlaying = signal(false);
  isLoading = signal(false);
  progress = signal(0);
  currentTime = signal(0);
  duration = signal(0);
  volume = signal(1);
  isMuted = signal(false);

  // Computed signals
  formattedCurrentTime = computed(() => this.formatTime(this.currentTime()));
  formattedDuration = computed(() => this.formatTime(this.duration()));

  private audio: HTMLAudioElement | null = null;
  private isBrowser = false;

  constructor(private supabaseService: SupabaseService) {
    this.isBrowser = typeof window !== 'undefined' && typeof Audio !== 'undefined';
    if (this.isBrowser) {
      this.initializeAudio();
    }
  }

  private initializeAudio() {
    if (!this.isBrowser) return;

    this.audio = new Audio();
    this.audio.preload = 'auto';

    // Eventos del reproductor
    this.audio.addEventListener('loadstart', () => {
      this.isLoading.set(true);
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.duration.set(this.audio?.duration || 0);
      this.isLoading.set(false);
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
      this.isPlaying.set(false);
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying.set(true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying.set(false);
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      this.isPlaying.set(false);
      this.isLoading.set(false);
    });

    this.audio.addEventListener('canplay', () => {
      this.isLoading.set(false);
    });
  }

  /**
   * Reproduce una canción desde Supabase Storage
   * @param song - Objeto Song con la información de la canción
   * @param audioPath - Ruta del archivo en Supabase Storage (ej: 'songs/shape-of-you.mp3')
   * @param useSignedUrl - Si usar URL firmada (para archivos privados) o pública
   */
  async playSong(song: Song, audioPath: string, useSignedUrl: boolean = false) {
    if (!this.isBrowser || !this.audio) return;

    try {
      this.isLoading.set(true);
      const previousSong = this.currentSong();
      this.currentSong.set(song);

      // Obtener URL del audio desde Supabase
      let audioUrl: string;
      
      if (useSignedUrl) {
        // Para archivos privados, obtener URL firmada
        audioUrl = await this.supabaseService.getSignedAudioUrl(audioPath);
      } else {
        // Para archivos públicos, obtener URL pública
        audioUrl = this.supabaseService.getPublicAudioUrl(audioPath);
      }

      // Si es una canción diferente, cargar el nuevo audio
      if (previousSong?.id !== song.id) {
        this.audio.src = audioUrl;
        this.audio.load();
      }

      // Reproducir
      await this.audio.play();
      this.isPlaying.set(true);
      
    } catch (error) {
      console.error('Error playing song:', error);
      this.isPlaying.set(false);
      this.isLoading.set(false);
      throw error;
    }
  }

  /**
   * Pausa o reanuda la reproducción
   */
  togglePlay() {
    if (!this.audio) return;

    if (this.isPlaying()) {
      this.audio.pause();
    } else {
      this.audio.play()
        .then(() => this.isPlaying.set(true))
        .catch(err => console.error('Play failed:', err));
    }
  }

  /**
   * Pausa la reproducción
   */
  pause() {
    if (this.audio && this.isPlaying()) {
      this.audio.pause();
    }
  }

  /**
   * Detiene la reproducción y resetea
   */
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.currentTime.set(0);
      this.progress.set(0);
      this.isPlaying.set(false);
    }
  }

  /**
   * Salta a una posición específica
   * @param percent - Porcentaje de la canción (0-100)
   */
  seek(percent: number) {
    if (!this.audio) return;
    
    const newTime = (percent / 100) * this.duration();
    this.audio.currentTime = newTime;
    this.currentTime.set(newTime);
    this.progress.set(percent);
  }

  /**
   * Ajusta el volumen
   * @param volume - Volumen de 0 a 1
   */
  setVolume(volume: number) {
    if (!this.audio) return;
    
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.audio.volume = clampedVolume;
    this.volume.set(clampedVolume);
    
    if (clampedVolume === 0) {
      this.isMuted.set(true);
    } else if (this.isMuted()) {
      this.isMuted.set(false);
    }
  }

  /**
   * Silencia o restaura el audio
   */
  toggleMute() {
    if (!this.audio) return;

    if (this.isMuted()) {
      this.audio.muted = false;
      this.isMuted.set(false);
    } else {
      this.audio.muted = true;
      this.isMuted.set(true);
    }
  }

  /**
   * Formatea segundos a mm:ss
   */
  private formatTime(sec: number): string {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  /**
   * Limpia los recursos del reproductor
   */
  destroy() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio.load();
      this.audio = null;
    }
  }
}