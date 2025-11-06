// src/app/app.ts
import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { PlayerComponent } from './player.component';
import { AudioPlayerService } from './services/audio-player.service';
import { songs } from './data/songs';
import { ScrollToTopComponent } from './scroll-to-top/scroll-to-top.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, PlayerComponent, ScrollToTopComponent],
  template: `
    <app-header></app-header>

    <!-- Layout persistente: el router cambia el contenido pero NO desmonta el player -->
    <div class="min-h-screen pb-28">
      <router-outlet></router-outlet>
    </div>

    <!-- Scroll to Top -->
    <app-scroll-to-top></app-scroll-to-top>

    <!-- Persistent Global Player: siempre montado -->
    <div class="fixed bottom-4 left-4 right-4 z-50 pointer-events-none transition-all duration-300 ease-in-out" 
         [class.opacity-0]="hidden()" 
         [class.translate-y-4]="hidden()">
      <div class="pointer-events-auto relative">
        <!-- Toggle button anclado al reproductor - solo visible cuando hay canción -->
        <button
          *ngIf="audio.currentSong() && !hidden()"
          class="absolute -top-12 right-4 z-10 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-300 group"
          (click)="togglePlayer($event)"
          [attr.aria-label]="'Ocultar reproductor'"
          [title]="'Ocultar reproductor'"
        >
          <!-- Arrow down when player is visible (to hide it) -->
          <svg class="w-4 h-4 text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <app-player
          [currentSong]="audio.currentSong()"
          [isPlaying]="audio.isPlaying()"
          [progress]="audio.progress()"
          [volume]="audio.volume()"
          [playbackRate]="audio.playbackRate()"
          [formattedCurrentTime]="audio.formattedCurrentTime()"
          [queueSongs]="getQueueSongs()"
          (playPause)="audio.togglePlay()"
          (next)="onNext()"
          (prev)="onPrevious()"
          (seek)="audio.seek($event)"
          (setVolume)="audio.setVolume($event)"
          (setPlaybackRate)="audio.setPlaybackRate($event)"
          (toggleMute)="audio.toggleMute()"
          (onQueueSongClick)="playSongFromQueue($event)"
        ></app-player>
      </div>
    </div>

    <!-- Pestaña pequeña cuando el reproductor está oculto - solo visible cuando hay canción -->
    <div 
      *ngIf="audio.currentSong() && hidden()"
      class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out"
    >
      <button
        class="bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 group min-w-[200px]"
        (click)="togglePlayer($event)"
        [attr.aria-label]="'Mostrar reproductor'"
        [title]="'Mostrar reproductor'"
      >
        <!-- Información de la canción actual -->
        <div class="flex items-center space-x-2 flex-1 min-w-0">
          <!-- Cover de la canción -->
          <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
            <img 
              *ngIf="audio.currentSong()?.cover" 
              [src]="audio.currentSong()?.cover" 
              [alt]="audio.currentSong()?.title"
              class="w-full h-full object-cover"
            >
            <div *ngIf="!audio.currentSong()?.cover" class="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 010 1.414L13.414 10l2.243 2.243a1 1 0 11-1.414 1.414L12 11.414l-2.243 2.243a1 1 0 01-1.414-1.414L10.586 10 8.343 7.757a1 1 0 011.414-1.414L12 8.586l2.243-2.243a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          
          <!-- Título y artista -->
          <div class="flex-1 min-w-0 text-left">
            <p class="text-white text-sm font-medium truncate">{{ audio.currentSong()?.title }}</p>
            <p class="text-white/70 text-xs truncate">{{ audio.currentSong()?.artist }}</p>
          </div>
        </div>

        <!-- Botón play/pause -->
        <div class="flex-shrink-0">
          <div class="w-6 h-6 flex items-center justify-center">
            <svg *ngIf="!audio.isPlaying()" class="w-4 h-4 text-white/70 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            <svg *ngIf="audio.isPlaying()" class="w-4 h-4 text-white/70 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
            </svg>
          </div>
        </div>

        <!-- Arrow up para mostrar el reproductor -->
        <svg class="w-4 h-4 text-white/50 group-hover:text-white/80 group-hover:scale-110 transition-all duration-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class App {
  hidden = signal(false);
  songs = songs;

  constructor(public audio: AudioPlayerService) {
    // No-op: removed smooth scroll integration (Lenis/GSAP) per request
  }

  togglePlayer(ev: Event) {
    ev.stopPropagation();
    this.hidden.set(!this.hidden());
  }

  getQueueSongs() {
    const currentIndex = this.audio.currentIndex();
    const nextSongs = this.songs.slice(currentIndex + 1);
    const previousSongs = this.songs.slice(0, currentIndex);
    return [...nextSongs, ...previousSongs];
  }

  async playSongFromQueue(queueIndex: number) {
    const currentIndex = this.audio.currentIndex();
    const actualIndex = (currentIndex + 1 + queueIndex) % this.songs.length;
    this.audio.currentIndex.set(actualIndex);
    const song = this.songs[actualIndex];
    try {
      await this.audio.playSong(song, song.audioPath, song.requiresSignedUrl || false);
    } catch (error) {
      console.error('Error playing song from queue:', error);
    }
  }

  async onNext() {
    const currentIndex = this.audio.currentIndex();
    const nextIndex = (currentIndex + 1) % this.songs.length;
    this.audio.currentIndex.set(nextIndex);
    const nextSong = this.songs[nextIndex];
    try {
      await this.audio.playSong(nextSong, nextSong.audioPath, nextSong.requiresSignedUrl || false);
    } catch (error) {
      console.error('Error playing next song:', error);
    }
  }

  async onPrevious() {
    const currentIndex = this.audio.currentIndex();
    const prevIndex = (currentIndex - 1 + this.songs.length) % this.songs.length;
    this.audio.currentIndex.set(prevIndex);
    const prevSong = this.songs[prevIndex];
    try {
      await this.audio.playSong(prevSong, prevSong.audioPath, prevSong.requiresSignedUrl || false);
    } catch (error) {
      console.error('Error playing previous song:', error);
    }
  }
}