import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Song } from './models/song';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="currentSong" class="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-t from-slate-900/95 to-black/80 backdrop-blur-lg border border-white/5 rounded-2xl p-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <img [src]="currentSong.cover" class="w-14 h-14 rounded-lg shadow-lg object-cover" />
          <div>
            <div class="text-white font-semibold">{{ currentSong.title }}</div>
            <div class="text-gray-400 text-sm">{{ currentSong.artist }}</div>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <button (click)="prev.emit()" class="p-2 text-gray-300 hover:text-white">⏮</button>
          <button (click)="playPause.emit()" class="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg text-white">{{ isPlaying ? '⏸' : '▶' }}</button>
          <button (click)="next.emit()" class="p-2 text-gray-300 hover:text-white">⏭</button>
        </div>

        <div class="flex items-center gap-4">
          <!-- Seek -->
          <input type="range" class="w-72" min="0" max="100" [value]="progress" (input)="onSeek($event)" />
          <div class="text-gray-400 text-sm">{{ formattedCurrentTime }} / {{ currentSong.duration }}</div>
        </div>

        <div class="flex items-center gap-4">
          <!-- Volume -->
          <button (click)="toggleMute.emit()" class="p-2">🔊</button>
          <input type="range" min="0" max="1" step="0.01" [value]="volume" (input)="onVolume($event)" class="w-28" />

          <!-- Playback rate -->
          <select [value]="playbackRate" (change)="onRate($event)" class="bg-transparent text-sm text-gray-300 p-1 rounded">
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
      </div>
    </div>
  `
})
export class PlayerComponent {
  @Input() currentSong: Song | null = null;
  @Input() isPlaying = false;
  @Input() progress = 0;
  @Input() volume = 1;
  @Input() playbackRate = 1;
  @Input() formattedCurrentTime = '0:00';
  @Output() playPause = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();
  @Output() seek = new EventEmitter<number>();
  @Output() setVolume = new EventEmitter<number>();
  @Output() setPlaybackRate = new EventEmitter<number>();
  @Output() toggleMute = new EventEmitter<void>();

  onSeek(e: any) {
    const val = Number(e.target.value);
    this.seek.emit(val);
  }

  onVolume(e: any) {
    const v = Number(e.target.value);
    this.setVolume.emit(v);
  }

  onRate(e: any) {
    const r = Number(e.target.value);
    this.setPlaybackRate.emit(r);
  }
}
