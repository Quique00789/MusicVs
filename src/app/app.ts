// src/app/app.ts
import { Component, signal, computed } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from './header.component';
import { PlayerComponent } from './player.component';
import { AudioPlayerService } from './services/audio-player.service';
import { songs } from './data/songs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, HeaderComponent, PlayerComponent],
  template: `
    <app-header></app-header>

    <!-- Layout persistente: el router cambia el contenido pero NO desmonta el player -->
    <div class="min-h-screen pb-28">
      <router-outlet></router-outlet>
    </div>

    <!-- Persistent Global Player: siempre montado -->
    <div class="fixed bottom-4 left-4 right-4 z-50 pointer-events-none transition-all duration-300 ease-in-out" [class.opacity-0]="hidden()" [class.translate-y-4]="hidden()" [class.pointer-events-none]="hidden()">
      <div class="pointer-events-auto">
        <app-player
          [currentSong]="audio.currentSong()"
          [isPlaying]="audio.isPlaying()"
          [progress]="audio.progress()"
          [volume]="audio.volume()"
          [playbackRate]="audio.playbackRate()"
          [formattedCurrentTime]="audio.formattedCurrentTime()"
          (playPause)="audio.togglePlay()"
          (next)="onNext()"
          (prev)="onPrevious()"
          (seek)="audio.seek($event)"
          (setVolume)="audio.setVolume($event)"
          (setPlaybackRate)="audio.setPlaybackRate($event)"
          (toggleMute)="audio.toggleMute()"
        ></app-player>
      </div>
    </div>

    <!-- Control buttons: hide/show and queue -->
    <div class="fixed bottom-28 right-6 z-50 flex flex-col gap-2">
      <!-- Queue button -->
      <button
        *ngIf="!hidden()"
        class="group w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-105"
        (click)="toggleQueue($event)"
        aria-label="Ver cola de reproducción"
        title="Cola de reproducción"
      >
        <svg class="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </button>

      <!-- Hide/Show button -->
      <button
        class="group w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-105"
        (click)="togglePlayer($event)"
        [attr.aria-label]="hidden() ? 'Mostrar reproductor' : 'Ocultar reproductor'"
        [title]="hidden() ? 'Mostrar reproductor' : 'Ocultar reproductor'"
      >
        <svg *ngIf="!hidden()" class="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
        <svg *ngIf="hidden()" class="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>

    <!-- Queue Panel -->
    <div 
      *ngIf="showQueue()"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      (click)="toggleQueue($event)"
    >
      <div 
        class="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gradient-to-b from-slate-900 to-black border-l border-white/10 shadow-2xl overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <div class="flex flex-col h-full">
          <!-- Queue Header -->
          <div class="flex items-center justify-between p-6 border-b border-white/10">
            <h2 class="text-xl font-bold text-white">Cola de reproducción</h2>
            <button 
              (click)="toggleQueue($event)"
              class="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg class="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Current Playing -->
          <div *ngIf="audio.currentSong()" class="p-6 border-b border-white/10 bg-white/5">
            <div class="text-xs text-gray-400 mb-2">Reproduciendo ahora</div>
            <div class="flex items-center gap-3">
              <img [src]="audio.currentSong()!.cover" class="w-12 h-12 rounded-lg shadow-lg object-cover" />
              <div class="flex-1 min-w-0">
                <div class="text-white font-semibold truncate">{{ audio.currentSong()!.title }}</div>
                <div class="text-gray-400 text-sm truncate">{{ audio.currentSong()!.artist }}</div>
              </div>
            </div>
          </div>

          <!-- Queue List -->
          <div class="flex-1 overflow-y-auto p-4">
            <div class="text-xs text-gray-400 mb-3 px-2">Siguiente en la cola</div>
            <div class="space-y-2">
              <div 
                *ngFor="let song of getQueueSongs(); let i = index"
                class="group flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                (click)="playSongFromQueue(i)"
              >
                <div class="text-gray-500 text-sm w-6 text-center">{{ i + 1 }}</div>
                <img [src]="song.cover" class="w-10 h-10 rounded-md shadow-md object-cover" />
                <div class="flex-1 min-w-0">
                  <div class="text-white text-sm font-medium truncate group-hover:text-cyan-400 transition-colors">{{ song.title }}</div>
                  <div class="text-gray-400 text-xs truncate">{{ song.artist }}</div>
                </div>
                <div class="text-gray-500 text-xs">{{ song.duration }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class App {
  // Controlamos ocultar/mostrar con una clase en el propio Player para no desmontarlo
  hidden = signal(false);
  showQueue = signal(false);
  songs = songs; // Importamos las canciones para la navegación

  constructor(public audio: AudioPlayerService, private router: Router) {}

  togglePlayer(ev: Event) {
    ev.stopPropagation();
    this.hidden.set(!this.hidden());
  }

  toggleQueue(ev: Event) {
    ev.stopPropagation();
    this.showQueue.set(!this.showQueue());
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