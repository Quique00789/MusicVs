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
              <button (click)="onToggleQueue()" class="p-1 text-gray-400 hover:text-white transition-colors">
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
      
      <!-- Desktop Layout -->
      <div class="hidden sm:block">
        <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="relative">
              <img [src]="currentSong.cover" class="w-14 h-14 rounded-lg shadow-lg object-cover" />
              <div class="absolute inset-0 rounded-lg overflow-hidden bg-black/20">
                <div class="flex items-end h-full w-full justify-between px-1">
                  <div *ngFor="let bar of visualizerBars; let i = index" 
                       class="bg-gradient-to-t from-cyan-400 to-blue-500 rounded-sm transition-all duration-100 flex-1 mx-px"
                       [style.height.%]="bar"
                       [style.animation-delay.ms]="i * 30">
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div class="text-white font-semibold">{{ currentSong.title }}</div>
              <div class="text-gray-400 text-sm">{{ currentSong.artist }}</div>
            </div>
          </div>

          <div class="flex items-center gap-6">
            <button (click)="prev.emit()" class="p-2 text-gray-300 hover:text-white transition-all duration-200 hover:scale-110">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            <button (click)="playPause.emit()" class="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg text-white hover:from-cyan-500 hover:to-blue-700 transition-all duration-200 hover:scale-105 active:scale-95">
              <svg *ngIf="!isPlaying" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="m7 4 10 8L7 20V4z"/>
              </svg>
              <svg *ngIf="isPlaying" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 19h4V5h-4M6 19h4V5H6v14Z"/>
              </svg>
            </button>
            <button (click)="next.emit()" class="p-2 text-gray-300 hover:text-white transition-all duration-200 hover:scale-110">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 18h2V6h-2M6 18l8.5-6L6 6v12z"/>
              </svg>
            </button>
          </div>

          <div class="flex items-center gap-4">
            <!-- Progreso restaurado -->
            <div class="relative w-72">
              <div class="h-2 bg-gray-700 rounded-lg overflow-hidden">
                <div class="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 rounded-lg relative" [style.width.%]="progress">
                  <div class="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-cyan-300/60 to-transparent blur-sm"></div>
                  <div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <input type="range" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" min="0" max="100" [value]="progress" (input)="onSeek($event)" />
            </div>
            <div class="text-gray-400 text-sm whitespace-nowrap">{{ formattedCurrentTime }} / {{ currentSong.duration }}</div>
          </div>

          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <button (click)="onToggleMuteClick()" class="p-2 text-gray-300 hover:text-white transition-all duration-200 hover:scale-110" [class.text-red-400]="isMuted">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <ng-container *ngIf="!isMuted; else mutedIcon">
                    <path *ngIf="volume > 0.5" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    <path *ngIf="volume <= 0.5 && volume > 0" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                    <path *ngIf="volume === 0" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A5.5 5.5 0 0 0 14 7.97v2.06c1.48.73 2.5 2.25 2.5 4.02z"/>
                  </ng-container>
                  <ng-template #mutedIcon>
                    <path d="M3 9v6h4l5 5V4L7 9H3z"/>
                    <path d="M19 5L5 19" stroke="currentColor" stroke-width="2"/>
                  </ng-template>
                </svg>
              </button>
              <div class="relative w-28">
                <div class="h-2 bg-gray-700 rounded-lg overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-200" [style.width.%]="displayVolume * 100"></div>
                </div>
                <input type="range" min="0" max="1" step="0.01" [value]="volume" (input)="onVolume($event)" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>

            <select [value]="playbackRate" (change)="onRate($event)" class="bg-gray-800/50 text-sm text-gray-300 px-2 py-1 rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-200 hover:bg-gray-700/50">
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>

            <div class="relative">
              <button (click)="onToggleQueue()" class="p-2 text-gray-300 hover:text-white transition-all duration-200 group relative hover:scale-110" [class.text-cyan-400]="showQueue()" title="Cola de reproducción">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="group-hover:scale-110 transition-transform">
                  <path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Layout -->
      <div class="block sm:hidden space-y-3">
        <div class="flex items-center gap-3">
          <div class="relative flex-shrink-0">
            <img [src]="currentSong.cover" class="w-12 h-12 rounded-lg shadow-lg object-cover" />
            <div class="absolute inset-0 rounded-lg overflow-hidden bg-black/20">
              <div class="flex items-end h-full w-full justify-between px-1">
                <div *ngFor="let bar of visualizerBars; let i = index" 
                     class="bg-gradient-to-t from-cyan-400 to-blue-500 rounded-sm transition-all duration-100 flex-1 mx-px"
                     [style.height.%]="bar"
                     [style.animation-delay.ms]="i * 30">
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="text-white font-medium text-sm truncate">{{ currentSong.title }}</div>
            <div class="text-gray-400 text-xs truncate">{{ currentSong.artist }}</div>
          </div>

          <div class="flex items-center gap-3 flex-shrink-0">
            <button (click)="prev.emit()" class="p-2 text-gray-300 hover:text-white transition-all duration-200" [class.opacity-50]="false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            <button (click)="playPause.emit()" class="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg text-white transition-all duration-200 active:scale-95">
              <svg *ngIf="!isPlaying" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="m7 4 10 8L7 20V4z"/>
              </svg>
              <svg *ngIf="isPlaying" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 19h4V5h-4M6 19h4V5H6v14Z"/>
              </svg>
            </button>
            <button (click)="next.emit()" class="p-2 text-gray-300 hover:text-white transition-all duration-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 18h2V6h-2M6 18l8.5-6L6 6v12z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-gray-400 text-xs">{{ formattedCurrentTime }}</div>
          <div class="relative flex-1">
            <div class="h-1.5 bg-gray-700 rounded-lg overflow-hidden">
              <div class="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 rounded-lg relative" [style.width.%]="progress">
                <div class="absolute right-0 top-0 h-full w-4 bg-gradient-to-l from-cyan-300/60 to-transparent blur-sm"></div>
                <div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-0.5 h-0.5 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <input type="range" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" min="0" max="100" [value]="progress" (input)="onSeek($event)" />
          </div>
          <div class="text-gray-400 text-xs">{{ currentSong.duration }}</div>
        </div>

        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 flex-1">
            <button (click)="onToggleMuteClick()" class="p-1.5 text-gray-300 hover:text-white transition-all duration-200" [class.text-red-400]="isMuted">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <ng-container *ngIf="!isMuted; else mutedIconMobile">
                  <path *ngIf="volume > 0.5" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                  <path *ngIf="volume <= 0.5 && volume > 0" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                  <path *ngIf="volume === 0" d="M3 9v6h4l5 5V4L7 9H3z"/>
                </ng-container>
                <ng-template #mutedIconMobile>
                  <path d="M3 9v6h4l5 5V4L7 9H3z"/>
                  <path d="M16 9l4 4m0-4l-4 4" stroke="currentColor" stroke-width="1.5"/>
                </ng-template>
              </svg>
            </button>
            <div class="relative flex-1 max-w-20">
              <div class="h-1.5 bg-gray-700 rounded-lg overflow-hidden">
                <div class="h-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-200" [style.width.%]="displayVolume * 100"></div>
              </div>
              <input type="range" min="0" max="1" step="0.01" [value]="volume" (input)="onVolume($event)" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>

          <select [value]="playbackRate" (change)="onRate($event)" class="bg-gray-800/50 text-xs text-gray-300 px-2 py-1 rounded-md border border-gray-600 hover:border-gray-500 transition-all duration-200">
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>

          <button (click)="onToggleQueue()" class="p-1.5 text-gray-300 hover:text-white transition-all duration-200" [class.text-cyan-400]="showQueue()" title="Cola">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>
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

  // Estado de mute con memoria
  isMuted = false;
  private previousVolume: number = 1;
  get displayVolume() { return this.isMuted ? 0 : this.volume; }

  ngAfterViewInit() { this.visualizerBars = Array(20).fill(0).map(() => Math.random() * 60 + 20); }

  onToggleQueue(){ this.showQueue.set(!this.showQueue()); }
  onSeek(e: any) { const val = Number(e.target.value); this.seek.emit(val); }
  onVolume(e: any) { const v = Number(e.target.value); this.isMuted = v === 0; this.setVolume.emit(v); }
  onRate(e: any) { const r = Number(e.target.value); this.setPlaybackRate.emit(r); }
  onToggleMuteClick(){ if(!this.isMuted){ this.previousVolume = this.volume; this.isMuted = true; this.setVolume.emit(0);} else { this.isMuted = false; this.setVolume.emit(this.previousVolume || 0.5);} }
}
