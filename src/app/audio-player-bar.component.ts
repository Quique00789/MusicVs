import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioPlayerService } from './services/audio-player.service';

@Component({
  selector: 'app-audio-player-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="audio-bar" *ngIf="currentSong()">
      <div class="info">
        <img *ngIf="currentSong()?.cover" [src]="currentSong()?.cover" class="cover"/>
        <div class="meta">
          <div class="title">{{ currentSong()?.title }}</div>
          <div class="artist">{{ currentSong()?.artist }}</div>
        </div>
      </div>
      <div class="controls">
        <button (click)="prev()" class="ctrl-btn" title="Anterior">
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M6 18V6h2v12zm3.5-6 7.5 6V6z"/></svg>
        </button>
        <button (click)="toggle()" class="ctrl-btn main" [disabled]="player.isLoading()" title="Pausar/Reanudar">
          <svg *ngIf="!player.isPlaying()" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <svg *ngIf="player.isPlaying()" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
        </button>
        <button (click)="next()" class="ctrl-btn" title="Siguiente">
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M16 6v12h-2V6zm-3.5 6L5 6v12z"/></svg>
        </button>
      </div>
      <div class="progress">
        <span>{{ player.formattedCurrentTime() }}</span>
        <input type="range" min="0" max="100" [value]="player.progress()" (input)="seek($event)" class="prog-slider"/>
        <span>{{ player.formattedDuration() }}</span>
      </div>
    </div>
  `,
  styles: [
    `.audio-bar{position:fixed;bottom:0;left:0;right:0;z-index:3000;display:flex;align-items:center;justify-content:space-between;background:rgba(24,24,24,0.95);box-shadow:0 -2px 20px 0 #0008;height:72px;padding:0 1.5rem;backdrop-filter:blur(6px);border-top:1px solid #222}
    .info{display:flex;align-items:center;gap:1rem;min-width:0}
    .cover{width:48px;height:48px;border-radius:6px;object-fit:cover;box-shadow:0 1px 6px #0005}
    .meta{min-width:0}
    .title{color:#fff;font-weight:700;font-size:1.07rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3}
    .artist{font-size:.95rem;color:#cbd5e1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .controls{display:flex;align-items:center;gap:.7rem;}
    .ctrl-btn{background:rgba(255,255,255,.07);border:none;border-radius:50%;padding:.5rem;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.2rem;cursor:pointer;transition:background .15s}
    .ctrl-btn.main{background:rgba(139,92,246,.1);font-size:1.3rem;}
    .ctrl-btn:active{transform:scale(.96);}
    .prog-slider{width:120px;margin:0 .5rem;}
    .progress{display:flex;align-items:center;gap:.6rem;width:270px;min-width:150px;}
    @media (max-width:750px){.progress{display:none} .audio-bar{height:54px;}}
    @media (max-width:500px){.audio-bar{padding:0 .45rem;height:48px}.cover{width:32px;height:32px} .progress{display:none;}}`
  ]
})
export class AudioPlayerBarComponent {
  player = inject(AudioPlayerService);
  currentSong = this.player.currentSong;
  toggle() { this.player.togglePlay(); }
  next() { /* Implementa salto adelante al siguiente de la playlist si quieres */ }
  prev() { /* Implementa salto atrás al anterior de la playlist si quieres */ }
  seek(event: any) {
    const percent = Number(event?.target?.value);
    this.player.seek(percent);
  }
}
