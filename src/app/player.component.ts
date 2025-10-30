import { Component, EventEmitter, Input, Output, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Song } from './models/song';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="currentSong" class="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-t from-slate-900/95 to-black/80 backdrop-blur-lg border border-white/5 rounded-2xl p-4 relative">
      <!-- Botón interno para ocultar/mostrar -->
      <button (click)="toggleCollapsed()"
              class="absolute -top-3 right-4 sm:right-6 translate-y-[-50%] bg-slate-800/90 text-white/80 hover:text-white border border-white/10 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
        <svg *ngIf="!collapsed()" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15l-6-6h12l-6 6z"/></svg>
        <svg *ngIf="collapsed()" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9l6 6H6l6-6z"/></svg>
      </button>

      <!-- Contenido colapsable -->
      <div [class.opacity-50]="collapsed()" [class.pointer-events-none]="collapsed()" [class.h-0]="collapsed()" [class.overflow-hidden]="collapsed()">
        <div class="hidden sm:block">
          <!-- contenido desktop existente (omitido aquí por brevedad) -->
        </div>
        <div class="block sm:hidden">
          <!-- contenido móvil existente (omitido aquí por brevedad) -->
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
  collapsed = signal(false);

  visualizerBars: number[] = [];

  ngAfterViewInit() {}

  toggleCollapsed(){ this.collapsed.set(!this.collapsed()); }
}
