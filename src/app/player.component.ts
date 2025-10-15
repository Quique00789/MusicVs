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
          <div class="w-56 h-2 bg-white/10 rounded-full relative">
            <div class="absolute top-0 left-0 h-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" [style.width.%]="progress"></div>
          </div>
          <div class="text-gray-400 text-sm">{{ currentSong.duration }}</div>
        </div>
      </div>
    </div>
  `
})
export class PlayerComponent {
  @Input() currentSong: Song | null = null;
  @Input() isPlaying = false;
  @Input() progress = 0;
  @Output() playPause = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();
}
