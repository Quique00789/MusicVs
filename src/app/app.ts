// src/app/app.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { songs } from './data/songs';
import { Song } from './models/song';
import { SongCardComponent } from './song-card.component';
import { PlayerComponent } from './player.component';
import { HeaderComponent } from './header.component';
import { HeroComponent } from './hero.component';
import { StickySectionComponent } from './sticky-section.component';
import { AudioPlayerService } from './services/audio-player.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SongCardComponent,
    PlayerComponent,
    HeaderComponent,
    HeroComponent,
    StickySectionComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  songs: Song[] = songs;

  currentSong: any;
  isPlaying: any;
  isLoading: any;
  progress: any;
  currentTime: any;
  duration: any;
  volume: any;
  // Exponer signals del servicio para el template
  constructor(private audioPlayerService: AudioPlayerService) {}

  ngOnInit() {
    // Ahora ya existe audioPlayerService
    this.currentSong = this.audioPlayerService.currentSong;
    this.isPlaying = this.audioPlayerService.isPlaying;
    this.isLoading = this.audioPlayerService.isLoading;
    this.progress = this.audioPlayerService.progress;
    this.currentTime = this.audioPlayerService.currentTime;
    this.duration = this.audioPlayerService.duration;
    this.volume = this.audioPlayerService.volume;
  }

  ngOnDestroy() {
    this.audioPlayerService.destroy();
  }
  

  

  /**
   * Maneja el evento de reproducción desde las tarjetas de canciones
   */
  async onPlay(song: Song) {
    const currentSong = this.currentSong();
    
    // Si es la misma canción, toggle play/pause
    if (currentSong?.id === song.id) {
      this.togglePlay();
      return;
    }

    // Si es una canción diferente, reproducir
    try {
      await this.audioPlayerService.playSong(
        song,
        song.audioPath,
        song.requiresSignedUrl || false
      );
      
      // Actualizar índice actual
      const index = this.songs.findIndex(s => s.id === song.id);
      if (index >= 0) {
        this.audioPlayerService.currentIndex.set(index);
      }
    } catch (error) {
      console.error('Error playing song:', error);
      // Aquí podrías mostrar un toast o notificación de error
    }
  }

  /**
   * Toggle play/pause
   */
  togglePlay() {
    const currentSong = this.currentSong();
    
    if (!currentSong) {
      // Si no hay canción, reproducir la primera
      this.onPlay(this.songs[0]);
      return;
    }

    this.audioPlayerService.togglePlay();
  }

  /**
   * Siguiente canción
   */
  async next() {
    const currentIndex = this.audioPlayerService.currentIndex();
    const nextIndex = (currentIndex + 1) % this.songs.length;
    
    this.audioPlayerService.currentIndex.set(nextIndex);
    await this.onPlay(this.songs[nextIndex]);
  }

  /**
   * Canción anterior
   */
  async previous() {
    const currentIndex = this.audioPlayerService.currentIndex();
    const prevIndex = (currentIndex - 1 + this.songs.length) % this.songs.length;
    
    this.audioPlayerService.currentIndex.set(prevIndex);
    await this.onPlay(this.songs[prevIndex]);
  }

  /**
   * Seek a una posición específica
   */
  seek(percent: number) {
    this.audioPlayerService.seek(percent);
  }

  onSetVolume(v: number) {
    this.audioPlayerService.setVolume(v);
  }

  onSetPlaybackRate(r: number) {
    this.audioPlayerService.setPlaybackRate(r);
  }

  onToggleMute() {
    this.audioPlayerService.toggleMute();
  }

  get formattedCurrentTime() {
    return this.audioPlayerService.formattedCurrentTime();
  }

  playbackRate() {
    return this.audioPlayerService.playbackRate();
  }

  /**
   * TrackBy function para optimizar ngFor
   */
  trackByTitle(index: number, item: Song) {
    return item.id;
  }
}