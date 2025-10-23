import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PlaylistsService, Playlist } from '../services/playlists.service';
import { Song } from '../models/song';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen pt-24 pb-24 px-6" *ngIf="playlist as p">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-end gap-6 mb-10">
          <div class="w-40 h-40 rounded-2xl overflow-hidden neo-card">
            <div class="w-full h-full grid grid-cols-2 gap-0.5" *ngIf="p.tracks.length > 0; else emptyCover">
              <img *ngFor="let t of p.tracks | slice:0:4" [src]="t.cover || getDefaultCover()" [alt]="t.title" class="w-full h-full object-cover">
            </div>
            <ng-template #emptyCover>
              <div class="w-full h-full bg-gradient-to-br from-purple-600/20 to-cyan-600/20"></div>
            </ng-template>
          </div>
          <div>
            <div class="text-sm text-gray-400">Playlist</div>
            <h1 class="text-5xl font-bold gradient-text">{{ p.name }}</h1>
            <div class="text-gray-400 mt-2">{{ p.tracks.length }} canciones</div>
          </div>
        </div>

        <div class="glass-card">
          <div *ngFor="let s of p.tracks; let i = index" class="flex items-center gap-4 p-4 border-b border-white/5 last:border-0">
            <div class="text-gray-500 w-6">{{ i + 1 }}</div>
            <div class="w-14 h-14 rounded-lg overflow-hidden">
              <img [src]="s.cover || getDefaultCover()" [alt]="s.title" class="w-full h-full object-cover">
            </div>
            <div class="flex-1">
              <div class="text-white font-medium">{{ s.title }}</div>
              <div class="text-gray-400 text-sm">{{ s.artist }}</div>
            </div>
            <div class="text-gray-400 text-sm">{{ s.duration || '3:30' }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PlaylistDetailComponent implements OnDestroy {
  playlist: Playlist | null = null;

  constructor(private route: ActivatedRoute, private playlistsService: PlaylistsService) {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.playlist = this.playlistsService.getPlaylist(id);
  }

  ngOnDestroy(): void {}

  getDefaultCover(): string {
    return 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg';
  }
}