import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Song } from './models/song';

@Component({
  selector: 'app-now-playing-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div *ngIf="open() && song" class="fixed inset-0 z-[60]">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="close.emit()"></div>

    <!-- Sheet -->
    <div class="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center">
      <div class="sm:max-w-sm w-full bg-gradient-to-b from-slate-900/95 to-black/95 text-white rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <!-- Grab handle / header -->
        <div class="p-4 text-center relative">
          <div class="mx-auto h-1 w-10 rounded-full bg-white/20"></div>
          <div class="mt-2 text-xs text-white/60">Now playing</div>
          <button class="absolute right-4 top-4 p-2 text-white/70 hover:text-white" (click)="close.emit()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Artwork -->
        <div class="px-4">
          <div class="relative rounded-2xl overflow-hidden shadow-xl">
            <img [src]="song!.cover" class="w-full aspect-square object-cover"/>
          </div>
          <div class="mt-4">
            <div class="text-base font-semibold truncate">{{ song!.title }}</div>
            <div class="text-sm text-white/60 truncate">{{ song!.artist }}</div>
          </div>
        </div>

        <!-- Progress -->
        <div class="px-4 mt-4">
          <div class="flex items-center gap-3 text-xs text-white/60">
            <div class="tabular-nums">{{ currentTime }}</div>
            <div class="relative flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div class="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-blue-500" [style.width.%]="progress"></div>
              <input type="range" min="0" max="100" [value]="progress" (input)="seek.emit($any($event.target).value)" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
            </div>
            <div class="tabular-nums">{{ duration }}</div>
          </div>
        </div>

        <!-- Controls -->
        <div class="px-4 mt-4 pb-6">
          <div class="flex items-center justify-between">
            <button (click)="toggleShuffle.emit()" class="p-2 text-white/70 hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"/><path d="M4 20l7-7 3-3"/><path d="M16 8l5-5"/></svg>
            </button>
            <button (click)="prev.emit()" class="p-3 text-white/80 hover:text-white">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button (click)="playPause.emit()" class="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 shadow-xl flex items-center justify-center">
              <svg *ngIf="!isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="m7 4 10 8L7 20V4z"/></svg>
              <svg *ngIf="isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 19h4V5h-4M6 19h4V5H6v14Z"/></svg>
            </button>
            <button (click)="next.emit()" class="p-3 text-white/80 hover:text-white">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16 18h2V6h-2M6 18l8.5-6L6 6v12z"/></svg>
            </button>
            <button (click)="onToggleMuteClick()" class="p-2 text-white/70 hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <ng-container *ngIf="!isMuted; else mutedIcon"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></ng-container>
                <ng-template #mutedIcon><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M19 5L5 19" stroke="currentColor" stroke-width="2"/></ng-template>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class NowPlayingSheetComponent {
  @Input() open = signal(false);
  @Input() song: Song | null = null;
  @Input() isPlaying = false;
  @Input() progress = 0;
  @Input() currentTime = '0:00';
  @Input() duration = '0:00';
  @Input() volume = 1;

  @Output() close = new EventEmitter<void>();
  @Output() playPause = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();
  @Output() seek = new EventEmitter<number>();
  @Output() toggleShuffle = new EventEmitter<void>();
  @Output() setVolume = new EventEmitter<number>();

  isMuted = false;
  previousVolume = 1;
  onToggleMuteClick(){
    if(!this.isMuted){ this.previousVolume = this.volume; this.isMuted = true; this.setVolume.emit(0);} else { this.isMuted = false; this.setVolume.emit(this.previousVolume || 0.5);} 
  }
}
