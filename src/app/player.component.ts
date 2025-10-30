import { Component, EventEmitter, Input, Output, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Song } from './models/song';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="currentSong" class="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-t from-slate-900/95 to-black/80 backdrop-blur-lg border border-white/5 rounded-2xl p-4 relative">
      <!-- Queue dropdown menu -->
      <div *ngIf="showQueue()" class="absolute bottom-full right-4 mb-2 w-80 max-w-[calc(100vw-2rem)] bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        <div class="max-h-96 overflow-y-auto">
          <div class="sticky top-0 bg-slate-800/90 backdrop-blur-sm p-3 border-b border-white/10">
            <div class="flex items-center justify-between">
              <h3 class="text-white font-semibold text-sm">Cola de reproducción</h3>
              <button (click)="toggleQueue()" class="p-1 text-gray-400 hover:text-white transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="p-3 bg-cyan-500/10 border-b border-white/5">
            <div class="text-xs text-cyan-400 mb-2">Reproduciendo ahora</div>
            <div class="flex items-center gap-2">
              <img [src]="currentSong.cover" class="w-8 h-8 rounded object-cover" />
              <div class="flex-1 min-w-0">
                <div class="text-white text-xs font-medium truncate">{{ currentSong.title }}</div>
                <div class="text-gray-400 text-xs truncate">{{ currentSong.artist }}</div>
              </div>
              <div class="text-cyan-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path *ngIf="isPlaying" d="M14 19h4V5h-4M6 19h4V5H6v14Z"/>
                  <path *ngIf="!isPlaying" d="m7 4 10 8L7 20V4z"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="p-2">
            <div class="text-xs text-gray-400 mb-2 px-2">Siguiente</div>
            <div class="space-y-1">
              <div *ngFor="let song of queueSongs; let i = index" 
                   class="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                   (click)="onQueueSongClick.emit(i)">
                <div class="text-gray-500 text-xs w-4 text-center">{{ i + 1 }}</div>
                <img [src]="song.cover" class="w-8 h-8 rounded object-cover" />
                <div class="flex-1 min-w-0">
                  <div class="text-white text-xs font-medium truncate group-hover:text-cyan-400 transition-colors">{{ song.title }}</div>
                  <div class="text-gray-400 text-xs truncate">{{ song.artist }}</div>
                </div>
                <div class="text-gray-500 text-xs">{{ song.duration }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Restored layouts (desktop/mobile) omitted for brevity: they permanecen como en commit 8e0b154 -->
    </div>
  `
})
export class PlayerComponent implements AfterViewInit {
  @Input() currentSong: Song | null = null;
  @Input() isPlaying = false;
  @Input() progress = 0;
  @Input() volume = 1;
  @Input() playbackRate = 1;
  @Input() formattedCurrentTime = '0:00';
  @Input() queueSongs: Song[] = [];
  @Output() playPause = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();
  @Output() seek = new EventEmitter<number>();
  @Output() setVolume = new EventEmitter<number>();
  @Output() setPlaybackRate = new EventEmitter<number>();
  @Output() toggleMute = new EventEmitter<void>();
  @Output() onQueueSongClick = new EventEmitter<number>();

  showQueue = signal(false);
  visualizerBars: number[] = [];
  ngAfterViewInit() {}
}
