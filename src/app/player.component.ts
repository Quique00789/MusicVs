import { Component, EventEmitter, Input, Output, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Song } from './models/song';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Mini player (siempre visible). En móvil actúa como disparador a pantalla completa -->
    <div *ngIf="currentSong" class="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-t from-slate-900/95 to-black/80 backdrop-blur-lg border border-white/5 rounded-2xl p-4 relative">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 min-w-0 cursor-pointer md:cursor-default" (click)="openFullIfMobile()">
          <img [src]="currentSong.cover" class="w-14 h-14 rounded-lg shadow-lg object-cover flex-shrink-0" />
          <div class="min-w-0">
            <div class="text-white font-semibold truncate">{{ currentSong.title }}</div>
            <div class="text-gray-400 text-sm truncate">{{ currentSong.artist }}</div>
          </div>
        </div>

        <div class="hidden md:flex items-center gap-6">
          <button (click)="prev.emit()" class="p-2 text-gray-300 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button (click)="playPause.emit()" class="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg text-white hover:from-cyan-500 hover:to-blue-700 transition-all">
            <svg *ngIf="!isPlaying" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="m7 4 10 8L7 20V4z"/></svg>
            <svg *ngIf="isPlaying" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 19h4V5h-4M6 19h4V5H6v14Z"/></svg>
          </button>
          <button (click)="next.emit()" class="p-2 text-gray-300 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 18h2V6h-2M6 18l8.5-6L6 6v12z"/></svg>
          </button>
        </div>

        <div class="hidden md:flex items-center gap-4">
          <input type="range" class="w-72 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider" min="0" max="100" [value]="progress" (input)="onSeek($event)" />
          <div class="text-gray-400 text-sm whitespace-nowrap">{{ formattedCurrentTime }} / {{ currentSong.duration }}</div>
        </div>

        <div class="hidden md:flex items-center gap-4">
          <button (click)="toggleMute.emit()" class="p-2 text-gray-300 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77z"/></svg>
          </button>
          <input type="range" min="0" max="1" step="0.01" [value]="volume" (input)="onVolume($event)" class="w-28 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider" />
          <select [value]="playbackRate" (change)="onRate($event)" class="bg-gray-800/50 text-sm text-gray-300 px-2 py-1 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
            <option value="0.5">0.5x</option><option value="0.75">0.75x</option><option value="1">1x</option><option value="1.25">1.25x</option><option value="1.5">1.5x</option><option value="2">2x</option>
          </select>
          <button (click)="toggleQueue()" class="p-2 text-gray-300 hover:text-white transition-colors" [class.text-cyan-400]="showQueue()" title="Cola">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
          </button>
        </div>
      </div>

      <!-- Dropdown cola (se mantiene) -->
      <div *ngIf="showQueue()" class="absolute bottom-full right-4 mb-2 w-80 bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl overflow-hidden hidden md:block">
        <div class="max-h-96 overflow-y-auto">
          <div class="sticky top-0 bg-slate-800/90 backdrop-blur-sm p-3 border-b border-white/10">
            <div class="flex items-center justify-between">
              <h3 class="text-white font-semibold text-sm">Cola de reproducción</h3>
              <button (click)="toggleQueue()" class="p-1 text-gray-400 hover:text-white transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
          <div class="p-2">
            <div class="text-xs text-gray-400 mb-2 px-2">Siguiente</div>
            <div class="space-y-1">
              <div *ngFor="let song of queueSongs; let i = index" class="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group" (click)="onQueueSongClick.emit(i)">
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
    </div>

    <!-- Full-screen mobile player -->
    <div *ngIf="expanded() && currentSong" class="fixed inset-0 z-[70] md:hidden bg-gradient-to-b from-black via-slate-900 to-black text-white">
      <!-- background blur from cover -->
      <div class="absolute inset-0 -z-10 opacity-30" [style.background-image]="'url(' + currentSong.cover + ')'" style="background-size:cover;background-position:center;filter:blur(24px)"></div>

      <div class="flex flex-col h-full">
        <!-- header -->
        <div class="flex items-center justify-between p-4">
          <button (click)="expanded.set(false)" aria-label="Cerrar" class="p-2 rounded-full bg-white/10">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="text-sm text-gray-300">Reproduciendo ahora</div>
          <button (click)="toggleQueueMobile()" class="p-2 text-gray-300" aria-label="Cola">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
          </button>
        </div>

        <!-- cover -->
        <div class="flex-1 flex items-center justify-center px-6">
          <img [src]="currentSong.cover" class="w-[78vw] max-w-sm rounded-2xl shadow-2xl" />
        </div>

        <!-- title/artist -->
        <div class="px-6 mt-4 text-center">
          <div class="text-xl font-semibold truncate">{{ currentSong.title }}</div>
          <div class="text-gray-400 truncate">{{ currentSong.artist }}</div>
        </div>

        <!-- progress -->
        <div class="px-6 mt-4">
          <div class="flex items-center gap-3 w-full">
            <span class="text-xs text-gray-400 tabular-nums">{{ formattedCurrentTime }}</span>
            <div class="relative flex-1 h-3">
              <input type="range" class="seek w-full h-3 appearance-none bg-transparent" min="0" max="100" [value]="progress" (input)="onSeek($event)" />
              <div class="pointer-events-none absolute inset-0 rounded-full bg-white/10"></div>
              <div class="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" [style.width.%]="progress"></div>
            </div>
            <span class="text-xs text-gray-400">{{ currentSong.duration }}</span>
          </div>
        </div>

        <!-- controls -->
        <div class="px-6 mt-3 mb-6 flex items-center justify-center gap-6">
          <button (click)="prev.emit()" class="p-3 text-gray-300 hover:text-white">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button (click)="playPause.emit()" class="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-xl">
            <svg *ngIf="!isPlaying" width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="m7 4 10 8L7 20V4z"/></svg>
            <svg *ngIf="isPlaying" width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M14 19h4V5h-4M6 19h4V5H6v14Z"/></svg>
          </button>
          <button (click)="next.emit()" class="p-3 text-gray-300 hover:text-white">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M16 18h2V6h-2M6 18l8.5-6L6 6v12z"/></svg>
          </button>
        </div>

        <!-- bottom actions -->
        <div class="px-6 pb-6 flex items-center justify-between text-gray-300">
          <button aria-label="Like" class="p-2">❤</button>
          <button aria-label="Añadir a playlist" class="p-2">＋</button>
          <button aria-label="Dispositivos" class="p-2">📶</button>
          <button aria-label="Switch to video" class="p-2 border border-white/30 rounded-md px-3 py-1">Switch to video</button>
        </div>
      </div>

      <!-- Cola en móvil como sheet -->
      <div *ngIf="queueMobile()" class="fixed inset-x-0 bottom-0 z-[80] bg-slate-900/95 border-t border-white/10 rounded-t-2xl p-4 max-h-[55vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-2">
          <div class="text-white font-semibold">Cola de reproducción</div>
          <button (click)="queueMobile.set(false)" class="p-2">✕</button>
        </div>
        <div class="space-y-2">
          <div *ngFor="let song of queueSongs; let i = index" class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5" (click)="onQueueSongClick.emit(i)">
            <img [src]="song.cover" class="w-10 h-10 rounded object-cover" />
            <div class="flex-1 min-w-0">
              <div class="text-white text-sm font-medium truncate">{{ song.title }}</div>
              <div class="text-gray-400 text-xs truncate">{{ song.artist }}</div>
            </div>
            <div class="text-gray-500 text-xs">{{ song.duration }}</div>
          </div>
        </div>
      </div>

      <style>
        .seek::-webkit-slider-thumb { appearance:none; height:18px; width:18px; border-radius:9999px; background:white; border:2px solid #22d3ee; box-shadow:0 2px 8px rgba(34,211,238,.35);} 
        .seek::-moz-range-thumb { height:18px; width:18px; border-radius:9999px; background:white; border:2px solid #22d3ee; box-shadow:0 2px 8px rgba(34,211,238,.35);} 
      </style>
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
  expanded = signal(false);
  queueMobile = signal(false);

  private isMobile = false;

  @HostListener('window:resize') onResize() { this.isMobile = window.innerWidth < 768; }

  ngOnInit() { this.isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false; }

  openFullIfMobile() { if (this.isMobile) this.expanded.set(true); }
  toggleQueue() { this.showQueue.set(!this.showQueue()); }
  toggleQueueMobile() { this.queueMobile.set(!this.queueMobile()); }

  onSeek(e: any) { const val = Number(e.target.value); this.seek.emit(val); }
  onVolume(e: any) { const v = Number(e.target.value); this.setVolume.emit(v); }
  onRate(e: any) { const r = Number(e.target.value); this.setPlaybackRate.emit(r); }
}
