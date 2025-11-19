import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteButtonComponent } from './favorite-button.component';
import { AudioPlayerService } from './services/audio-player.service';

@Component({
  selector: 'app-favorite-row',
  standalone: true,
  imports: [CommonModule, FavoriteButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row" (click)="play()">
      <div class="cover">
        <img [src]="cover || '/assets/default-cover.jpg'" (error)="onError($event)"/>
      </div>
      <div class="meta">
        <div class="title" [title]="title">{{ title }}</div>
        <div class="artist" [title]="artist">{{ artist }}</div>
      </div>
      <div class="right">
        <div class="duration" *ngIf="duration">{{ format(duration) }}</div>
        <app-favorite-button
          [song]="{ id, title, artist, duration, cover }"
          size="small"
          (favoriteChanged)="onFavoriteChanged($event)"
        />
      </div>
    </div>
  `,
  styles: [`
    .row{display:flex;align-items:center;gap:.75rem;padding:.5rem .75rem;border-radius:.5rem;background:rgba(255,255,255,.04);}
    .row:hover{background:rgba(255,255,255,.08)}
    .cover{width:44px;height:44px;border-radius:.25rem;overflow:hidden;flex-shrink:0}
    .cover img{width:100%;height:100%;object-fit:cover}
    .meta{flex:1;min-width:0}
    .title{color:#fff;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .artist{color:#a1a1aa;font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .right{display:flex;align-items:center;gap:.5rem}
    .duration{color:#a1a1aa;font-variant-numeric:tabular-nums}
  `]
})
export class FavoriteRowComponent {
  @Input() id!: string;
  @Input() title!: string;
  @Input() artist!: string;
  @Input() cover?: string;
  @Input() duration?: number;
  @Input() onRemove?: (id: string) => void;
  @Output() favoriteChanged = new EventEmitter<{ isFavorite: boolean, success: boolean }>();

  private player = inject(AudioPlayerService);

  play(){
    const track = { id: this.id, title: this.title, artist: this.artist, duration: this.duration || 0, cover: this.cover, url: '' };
    this.player.playTrack(track, [track], 0);
  }

  onFavoriteChanged(event: { isFavorite: boolean, success: boolean }) {
    this.favoriteChanged.emit(event);
    if (!event.success) return;
    if (event.isFavorite === false) this.onRemove?.(this.id);
  }

  format(sec: number){
    const m = Math.floor(sec/60); const s = Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`;
  }

  onError(e: any){ e.target.src = '/assets/default-cover.jpg'; }
}
