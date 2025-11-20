// src/app/services/audio-player.service.ts
import { Injectable, signal, computed, NgZone } from '@angular/core';
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
  volume = signal(0.8);
  isMuted = signal(false);
  playbackRate = signal(1);
  hasError = signal(false);
  errorMessage = signal<string | null>(null);

  // Computed signals
  formattedCurrentTime = computed(() => this.formatTime(this.currentTime()));
  formattedDuration = computed(() => this.formatTime(this.duration()));

  private audio: HTMLAudioElement | null = null;
  private isBrowser = false;
  private lastPlayedUrl = '';
  private retryCount = 0;
  private maxRetries = 3;
  private isInitialized = false;
  private currentPlaylist: any[] = [];
  private autoPlayNext = false;

  constructor(
    private supabaseService: SupabaseService,
    private ngZone: NgZone
  ) {
    this.isBrowser = typeof window !== 'undefined' && typeof Audio !== 'undefined';
    if (this.isBrowser) {
      this.initializeAudio();
    }
  }

  private initializeAudio() {
    if (!this.isBrowser || this.isInitialized) return;

    try {
      this.audio = new Audio();
      this.audio.preload = 'metadata';
      this.audio.volume = this.volume();
      this.audio.crossOrigin = 'anonymous';
      
      // Configurar eventos dentro de NgZone para asegurar detección de cambios
      this.ngZone.run(() => {
        this.setupAudioEvents();
      });
      
      this.isInitialized = true;
      console.log('Audio player initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio player:', error);
      this.handleError('Failed to initialize audio player', error);
    }
  }

  private setupAudioEvents() {
    if (!this.audio) return;

    // Evento de carga iniciada
    this.audio.addEventListener('loadstart', () => {
      this.ngZone.run(() => {
        this.isLoading.set(true);
        this.hasError.set(false);
        this.errorMessage.set(null);
      });
    });

    // Metadatos cargados
    this.audio.addEventListener('loadedmetadata', () => {
      this.ngZone.run(() => {
        const dur = this.audio?.duration || 0;
        if (isFinite(dur) && dur > 0) {
          this.duration.set(dur);
          // Actualizar duración en la canción actual
          const cs = this.currentSong();
          if (cs) {
            this.currentSong.set({ ...cs, duration: this.formatTime(dur) });
          }
        }
        this.isLoading.set(false);
        this.retryCount = 0; // Reset retry count on successful load
      });
    });

    // Datos suficientes para reproducir
    this.audio.addEventListener('canplay', () => {
      this.ngZone.run(() => {
        this.isLoading.set(false);
        this.hasError.set(false);
      });
    });

    // Actualización del tiempo
    this.audio.addEventListener('timeupdate', () => {
      if (!this.audio) return;
      
      this.ngZone.run(() => {
        const currentTime = this.audio!.currentTime;
        const duration = this.duration();
        
        if (isFinite(currentTime)) {
          this.currentTime.set(currentTime);
          
          if (duration > 0 && isFinite(duration)) {
            this.progress.set((currentTime / duration) * 100);
          }
        }
      });
    });

    // Canción terminada - auto-reproducir siguiente si hay cola
    this.audio.addEventListener('ended', () => {
      this.ngZone.run(() => {
        this.isPlaying.set(false);
        this.progress.set(100);
        
        // Auto-reproducir siguiente canción si está habilitado
        if (this.autoPlayNext && this.hasNext()) {
          console.log('Auto-playing next song in queue');
          this.playNext();
        }
      });
    });

    // Reproducción iniciada
    this.audio.addEventListener('play', () => {
      this.ngZone.run(() => {
        this.isPlaying.set(true);
        this.hasError.set(false);
      });
    });

    // Reproducción pausada
    this.audio.addEventListener('pause', () => {
      this.ngZone.run(() => {
        this.isPlaying.set(false);
      });
    });

    // Esperando datos
    this.audio.addEventListener('waiting', () => {
      this.ngZone.run(() => {
        this.isLoading.set(true);
      });
    });

    // Datos disponibles
    this.audio.addEventListener('canplaythrough', () => {
      this.ngZone.run(() => {
        this.isLoading.set(false);
      });
    });

    // Error en reproducción
    this.audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      this.ngZone.run(() => {
        this.handleAudioError(e);
      });
    });

    // Evento cuando no se puede reproducir por políticas del navegador
    this.audio.addEventListener('suspend', () => {
      console.log('Audio suspended - network issues or user interaction required');
    });
  }

  private handleAudioError(event: Event) {
    const audio = event.target as HTMLAudioElement;
    let errorMsg = 'Error de reproducción desconocido';
    
    if (audio?.error) {
      switch (audio.error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMsg = 'Reproducción cancelada por el usuario';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMsg = 'Error de red - verifica tu conexión';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMsg = 'Error al decodificar el archivo de audio';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMsg = 'Formato de audio no soportado o archivo no encontrado';
          break;
        default:
          errorMsg = `Error de audio (código: ${audio.error.code})`;
      }
    }
    
    this.handleError(errorMsg, event);
  }

  private handleError(message: string, error: any) {
    console.error('AudioPlayerService error:', message, error);
    this.isPlaying.set(false);
    this.isLoading.set(false);
    this.hasError.set(true);
    this.errorMessage.set(message);
  }

  /**
   * Verifica si el archivo existe antes de intentar reproducirlo
   */
  private async verifyAudioFile(audioPath: string): Promise<boolean> {
    try {
      const exists = await this.supabaseService.fileExists(audioPath);
      if (!exists) {
        console.error(`Audio file not found: ${audioPath}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error verifying audio file:', error);
      return false;
    }
  }

  /**
   * Reproduce una canción desde Supabase Storage
   */
  async playSong(song: Song, audioPath?: string, useSignedUrl: boolean = false) {
    if (!this.isBrowser || !this.audio) {
      console.warn('Audio player not available in this environment');
      return;
    }

    try {
      this.isLoading.set(true);
      this.hasError.set(false);
      this.errorMessage.set(null);
      
      const previousSong = this.currentSong();
      this.currentSong.set(song);

      // Usar audioPath del parámetro o del objeto song
      let pathToUse = audioPath || song.audioPath;
      if (!pathToUse) {
        throw new Error('No se especificó la ruta del audio');
      }

      // Limpiar la ruta - remover 'audio/' si ya está en el path
      if (pathToUse.startsWith('audio/')) {
        pathToUse = pathToUse.substring(6);
      }
      
      // Asegurar que la ruta tenga el formato correcto
      const finalPath = `audio/${pathToUse.replace(/^\/+/, '')}`;
      
      console.log('Processing audio path:', {
        original: audioPath || song.audioPath,
        cleaned: pathToUse,
        final: finalPath
      });

      // Verificar si el archivo existe
      const exists = await this.verifyAudioFile(finalPath);
      if (!exists) {
        throw new Error(`Archivo de audio no encontrado: ${finalPath}`);
      }

      // Obtener URL del audio desde Supabase
      let audioUrl: string;
      
      if (useSignedUrl || song.requiresSignedUrl) {
        audioUrl = await this.supabaseService.getSignedAudioUrl(finalPath);
      } else {
        audioUrl = this.supabaseService.getPublicAudioUrl(finalPath);
      }

      console.log('Loading audio from URL:', audioUrl);

      // Si es una canción diferente o la URL cambió, cargar el nuevo audio
      if (previousSong?.id !== song.id || this.lastPlayedUrl !== audioUrl) {
        this.audio.src = audioUrl;
        this.lastPlayedUrl = audioUrl;
        this.audio.load();
        
        // Esperar a que esté listo para reproducir
        await new Promise((resolve, reject) => {
          const handleCanPlay = () => {
            this.audio!.removeEventListener('canplay', handleCanPlay);
            this.audio!.removeEventListener('error', handleError);
            resolve(void 0);
          };
          
          const handleError = (e: Event) => {
            this.audio!.removeEventListener('canplay', handleCanPlay);
            this.audio!.removeEventListener('error', handleError);
            reject(new Error('Failed to load audio'));
          };
          
          this.audio!.addEventListener('canplay', handleCanPlay, { once: true });
          this.audio!.addEventListener('error', handleError, { once: true });
          
          // Timeout para evitar esperas indefinidas
          setTimeout(() => {
            this.audio!.removeEventListener('canplay', handleCanPlay);
            this.audio!.removeEventListener('error', handleError);
            reject(new Error('Audio load timeout'));
          }, 10000);
        });
      }

      // Reproducir con manejo de políticas de autoplay
      const playPromise = this.audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        this.isPlaying.set(true);
      }
      
      this.retryCount = 0;
      console.log('Song playing successfully:', song.title);
      
    } catch (error: any) {
      console.error('Error playing song:', error);
      
      // Manejo especial para errores de autoplay
      if (error.name === 'NotAllowedError') {
        this.handleError('Se requiere interacción del usuario para reproducir', error);
      } else if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying playback (${this.retryCount}/${this.maxRetries})...`);
        setTimeout(() => this.playSong(song, audioPath, useSignedUrl), 1000 * this.retryCount);
      } else {
        this.handleError('No se pudo reproducir la canción después de varios intentos', error);
      }
    }
  }

  /**
   * Compatibility method for new components - plays a track with playlist support
   */
  async playTrack(track: any, playlist: any[] = [], index: number = 0) {
    try {
      // Store playlist for navigation
      this.currentPlaylist = playlist;
      this.currentIndex.set(index);
      
      // Convert track to Song format
      const song: Song = {
        id: track.id,
        title: track.title,
        artist: track.artist,
        duration: this.formatTimeFromSeconds(track.duration || 0),
        cover: track.cover,
        audioPath: track.url || track.audioPath || `${track.id}.mp3`,
        requiresSignedUrl: false
      };
      
      await this.playSong(song);
    } catch (error) {
      console.error('Error in playTrack:', error);
      this.handleError('Error al reproducir la canción', error);
    }
  }

  /**
   * Reproduce toda la lista de reproducción desde el inicio
   */
  async playAll(playlist: any[], startIndex: number = 0) {
    if (!playlist || playlist.length === 0) {
      console.warn('No hay canciones en la lista de reproducción');
      return;
    }

    try {
      this.currentPlaylist = playlist;
      this.currentIndex.set(startIndex);
      this.autoPlayNext = true; // Habilitar auto-play
      
      console.log('Playing all songs from playlist:', {
        total: playlist.length,
        startIndex: startIndex
      });
      
      // Reproducir la primera canción (o la del índice especificado)
      await this.playTrack(playlist[startIndex], playlist, startIndex);
    } catch (error) {
      console.error('Error playing all songs:', error);
      this.handleError('Error al reproducir la lista', error);
    }
  }

  /**
   * Reproduce la siguiente canción en la cola
   */
  async playNext() {
    if (!this.hasNext()) {
      console.log('No more songs in queue');
      this.autoPlayNext = false;
      return;
    }

    const nextIndex = this.currentIndex() + 1;
    this.currentIndex.set(nextIndex);
    
    const nextTrack = this.currentPlaylist[nextIndex];
    console.log('Playing next song:', nextTrack?.title, 'at index', nextIndex);
    
    await this.playTrack(nextTrack, this.currentPlaylist, nextIndex);
  }

  /**
   * Reproduce la canción anterior en la cola
   */
  async playPrevious() {
    if (!this.hasPrevious()) {
      console.log('Already at first song');
      return;
    }

    const prevIndex = this.currentIndex() - 1;
    this.currentIndex.set(prevIndex);
    
    const prevTrack = this.currentPlaylist[prevIndex];
    console.log('Playing previous song:', prevTrack?.title, 'at index', prevIndex);
    
    await this.playTrack(prevTrack, this.currentPlaylist, prevIndex);
  }

  /**
   * Verifica si hay una canción siguiente
   */
  hasNext(): boolean {
    return this.currentPlaylist.length > 0 && 
           this.currentIndex() < this.currentPlaylist.length - 1;
  }

  /**
   * Verifica si hay una canción anterior
   */
  hasPrevious(): boolean {
    return this.currentPlaylist.length > 0 && this.currentIndex() > 0;
  }

  /**
   * Detiene el auto-play de canciones
   */
  stopAutoPlay() {
    this.autoPlayNext = false;
  }

  /**
   * Habilita el auto-play de canciones
   */
  enableAutoPlay() {
    this.autoPlayNext = true;
  }

  /**
   * Compatibility method - returns current track info
   */
  getCurrentTrack(): { id: string } | null {
    const song = this.currentSong();
    return song ? { id: song.id } : null;
  }

  /**
   * Pausa o reanuda la reproducción
   */
  async togglePlay() {
    if (!this.audio) return;

    try {
      if (this.isPlaying()) {
        this.audio.pause();
      } else {
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
    } catch (error: any) {
      console.error('Toggle play failed:', error);
      if (error.name === 'NotAllowedError') {
        this.handleError('Se requiere interacción del usuario para reproducir', error);
      } else {
        this.handleError('Error al controlar la reproducción', error);
      }
    }
  }

  /**
   * Pausa la reproducción
   */
  pause() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  /**
   * Reanuda la reproducción
   */
  async resume() {
    if (this.audio && this.audio.paused && !this.hasError()) {
      try {
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (error) {
        console.error('Resume failed:', error);
        this.handleError('Error al reanudar la reproducción', error);
      }
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
      this.autoPlayNext = false;
    }
  }

  /**
   * Salta a una posición específica
   */
  seek(percent: number) {
    if (!this.audio || !isFinite(this.duration()) || this.duration() <= 0) return;
    
    try {
      const newTime = (percent / 100) * this.duration();
      if (isFinite(newTime) && newTime >= 0 && newTime <= this.duration()) {
        this.audio.currentTime = newTime;
        this.currentTime.set(newTime);
        this.progress.set(percent);
      }
    } catch (error) {
      console.error('Seek failed:', error);
    }
  }

  /**
   * Ajusta el volumen
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
   * Ajusta la velocidad de reproducción
   */
  setPlaybackRate(rate: number) {
    if (!this.audio) return;
    
    const clampedRate = Math.max(0.25, Math.min(3, rate));
    try {
      this.audio.playbackRate = clampedRate;
      this.playbackRate.set(clampedRate);
    } catch (error) {
      console.error('Set playback rate failed:', error);
    }
  }

  /**
   * Silencia o restaura el audio
   */
  toggleMute() {
    if (!this.audio) return;

    const newMutedState = !this.isMuted();
    this.audio.muted = newMutedState;
    this.isMuted.set(newMutedState);
  }

  /**
   * Reinicia el reproductor después de un error
   */
  retry() {
    if (this.hasError() && this.currentSong()) {
      this.retryCount = 0;
      const song = this.currentSong()!;
      this.playSong(song, song.audioPath, song.requiresSignedUrl);
    }
  }

  /**
   * Formatea segundos a mm:ss
   */
  private formatTime(sec: number): string {
    if (!sec || isNaN(sec) || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  /**
   * Formatea segundos numéricos a string mm:ss
   */
  private formatTimeFromSeconds(seconds: number): string {
    return this.formatTime(seconds);
  }

  /**
   * Verifica si el reproductor está listo
   */
  isReady(): boolean {
    return this.isBrowser && this.audio !== null && this.isInitialized;
  }

  /**
   * Obtiene información del estado actual
   */
  getState() {
    return {
      currentSong: this.currentSong(),
      isPlaying: this.isPlaying(),
      isLoading: this.isLoading(),
      hasError: this.hasError(),
      errorMessage: this.errorMessage(),
      progress: this.progress(),
      currentTime: this.formattedCurrentTime(),
      duration: this.formattedDuration(),
      volume: this.volume(),
      isMuted: this.isMuted(),
      currentIndex: this.currentIndex(),
      playlistLength: this.currentPlaylist.length,
      hasNext: this.hasNext(),
      hasPrevious: this.hasPrevious()
    };
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
    this.isInitialized = false;
    this.lastPlayedUrl = '';
    this.retryCount = 0;
    this.currentPlaylist = [];
    this.autoPlayNext = false;
  }
}