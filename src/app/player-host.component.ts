import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerComponent } from './player.component';
import { NowPlayingSheetComponent } from './now-playing-sheet.component';
import { AudioPlayerService } from './services/audio-player.service';

@Component({
  selector: 'app-player-host',
  standalone: true,
  imports: [CommonModule, PlayerComponent, NowPlayingSheetComponent],
  template: `
    <!-- Barra mini (existente) -->
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
      >
    </app-player>

    <!-- Pantalla completa tipo Spotify -->
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
  `
})
export class PlayerHostComponent {
  open = signal(false);
  constructor(public aps: AudioPlayerService) {}
  noop() {}
}
