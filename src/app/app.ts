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

    <!-- Layout persistente: el router cambia el contenido pero NO desmonta el player -->
    <div class="min-h-screen pb-28">
      <router-outlet></router-outlet>
    </div>

    <!-- Persistent Global Player: siempre montado -->
    <div class="fixed bottom-4 left-4 right-4 z-50 pointer-events-none">
      <div class="pointer-events-auto">
        <app-player
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
      </div>
    </div>

    <!-- Floating hide/show button -->
    <button
      class="fixed bottom-4 right-4 z-[60] px-3 py-2 rounded-full bg-black/70 text-white border border-white/10 backdrop-blur-md hover:bg-black/80"
      (click)="togglePlayer($event)"
      aria-label="Ocultar/Mostrar reproductor"
    >
      {{ hidden() ? 'Mostrar reproductor' : 'Ocultar reproductor' }}
    </button>
  `,
  styleUrls: ['./app.css']
})
export class App {
  // Controlamos ocultar/mostrar con una clase en el propio Player para no desmontarlo
  hidden = signal(false);

  constructor(public audio: AudioPlayerService) {}

  togglePlayer(ev: Event) {
    ev.stopPropagation();
    this.hidden.set(!this.hidden());
    const el = document.querySelector('app-player > div, app-player');
    if (el) {
      if (this.hidden()) {
        el.classList.add('opacity-0','translate-y-4','pointer-events-none');
      } else {
        el.classList.remove('opacity-0','translate-y-4','pointer-events-none');
      }
    }
  }
}
