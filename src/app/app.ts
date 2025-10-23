// src/app/app.ts
import { Component, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header.component';
import { PlayerComponent } from './player.component';
import { AudioPlayerService } from './services/audio-player.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, HeaderComponent, PlayerComponent],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>

    <!-- Persistent Global Player -->
    <app-player
      *ngIf="!isPlayerHidden()"
      [currentSong]="audio.currentSong()"
      [isPlaying]="audio.isPlaying()"
      [progress]="audio.progress()"
      [volume]="audio.volume()"
      [playbackRate]="audio.playbackRate()"
      [formattedCurrentTime]="audio.formattedCurrentTime()"
      (playPause)="audio.togglePlay()"
      (seek)="audio.seek($event)"
      (setVolume)="audio.setVolume($event)"
      (setPlaybackRate)="audio.setPlaybackRate($event)"
      (toggleMute)="audio.toggleMute()"
    ></app-player>

    <!-- Floating hide/show button -->
    <button
      class="fixed bottom-4 right-4 z-[60] px-3 py-2 rounded-full bg-black/70 text-white border border-white/10 backdrop-blur-md hover:bg-black/80"
      (click)="togglePlayer()"
      aria-label="Ocultar/Mostrar reproductor"
    >
      {{ isPlayerHidden() ? 'Mostrar reproductor' : 'Ocultar reproductor' }}
    </button>
  `,
  styleUrls: ['./app.css']
})
export class App {
  private hidden = signal(false);
  isPlayerHidden = computed(() => this.hidden());

  constructor(public audio: AudioPlayerService) {}

  togglePlayer() {
    this.hidden.set(!this.hidden());
  }
}
