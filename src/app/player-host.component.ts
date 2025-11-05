import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerComponent } from './player.component';
import { NowPlayingSheetComponent } from './now-playing-sheet.component';
import { AudioPlayerService } from './services/audio-player.service';

@Component({
  selector: 'app-player-host',
  standalone: true,
  imports: [CommonModule, PlayerComponent, NowPlayingSheetComponent],
  template: `
    <div class="fixed bottom-4 left-4 right-4 z-50" *ngIf="hasPlayedOnce()">
      <div class="relative max-w-7xl mx-auto">
        <button class="absolute -top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur border border-white/10 text-gray-200 text-xs px-3 py-1 rounded-full shadow hover:bg-black/80 transition"
                (click)="collapsed.set(!collapsed())"
                aria-label="Mostrar/Ocultar reproductor">
          {{ collapsed() ? 'Mostrar reproductor' : 'Ocultar reproductor' }}
        </button>
      </div>
    </div>

    <section *ngIf="!collapsed()" class="contents">
      <app-player 
        [currentSong]="aps.currentSong()" 
        [isPlaying]="aps.isPlaying()"
        [progress]="aps.progress()"
        [volume]="aps.volume()"
        [playbackRate]="aps.playbackRate()"
        [formattedCurrentTime]="aps.formattedCurrentTime()"
        [queueSongs]="[]"
        (playPause)="aps.togglePlay()"
        (next)="noop()"
        (prev)="noop()"
        (seek)="aps.seek($event)"
        (setVolume)="aps.setVolume($event)"
        (setPlaybackRate)="aps.setPlaybackRate($event)"
        (toggleMute)="aps.toggleMute()"
      ></app-player>
    </section>

    <app-now-playing-sheet
      [open]="open"
      [song]="aps.currentSong()"
      [isPlaying]="aps.isPlaying()"
      [progress]="aps.progress()"
      [currentTime]="aps.formattedCurrentTime()"
      [duration]="aps.formattedDuration()"
      [volume]="aps.volume()"
      (close)="open.set(false)"
      (playPause)="aps.togglePlay()"
      (next)="noop()"
      (prev)="noop()"
      (seek)="aps.seek($event)"
      (toggleShuffle)="noop()"
      (setVolume)="aps.setVolume($event)"
    />
  `,
  styles: [`
    :host { display:block; }
  `]
})
export class PlayerHostComponent {
  open = signal(false);
  collapsed = signal(false);
  hasPlayedOnce = computed(() => !!this.aps.currentSong());

  constructor(public aps: AudioPlayerService) {}
  noop() {}
}
