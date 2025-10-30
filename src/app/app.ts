// src/app/app.ts
import { Component, signal } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { PlayerComponent } from './player.component';
import { AudioPlayerService } from './services/audio-player.service';
import { SmoothScrollService } from './services/smooth-scroll.service';
import { songs } from './data/songs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, PlayerComponent],
  template: `
    <app-header></app-header>

    <!-- Layout persistente: el router cambia el contenido pero NO desmonta el player -->
    <div class="min-h-screen pb-28">
      <router-outlet></router-outlet>
    </div>

    <!-- Persistent Global Player: siempre montado -->
    <div class="fixed bottom-4 left-4 right-4 z-50 pointer-events-none transition-all duration-300 ease-in-out" [class.opacity-0]="hidden()" [class.translate-y-4]="hidden()">
      <div class="pointer-events-auto">
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

    <!-- Minimalist hide/show button with arrow icon -->
    <button
      class="fixed bottom-6 right-6 z-[60] w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-300 group"
      (click)="togglePlayer($event)"
      [attr.aria-label]="hidden() ? 'Mostrar reproductor' : 'Ocultar reproductor'"
      [title]="hidden() ? 'Mostrar reproductor' : 'Ocultar reproductor'"
    >
      <!-- Arrow up when player is visible (to hide it) -->
      <svg *ngIf="!hidden()" class="w-4 h-4 text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
      </svg>
      
      <!-- Arrow down when player is hidden (to show it) -->
      <svg *ngIf="hidden()" class="w-4 h-4 text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  `,
  styleUrls: ['./app.css']
})
export class App {
  hidden = signal(false);
  songs = songs;

  constructor(public audio: AudioPlayerService, private router: Router, private smoothScroll: SmoothScrollService) {
    // Refresh scroll libraries after navigation so ScrollTrigger/Lenis recalc sizes
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        try {
          this.smoothScroll.refreshScrollTrigger();
        } catch (e) {
          console.warn('Error refreshing smooth scroll after navigation', e);
        }
      }
    });
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
