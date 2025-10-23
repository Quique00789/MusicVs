import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ArtistsService, Artist } from '../services/artists.service';
import { Song } from '../models/song';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen pt-24 pb-24 px-6">
      <div class="max-w-7xl mx-auto" *ngIf="artist as a">
        <div class="flex flex-col md:flex-row md:items-end gap-6 mb-10">
          <div class="w-40 h-40 rounded-2xl overflow-hidden neo-card">
            <img [src]="a.image || getDefaultCover()" [alt]="a.name" class="w-full h-full object-cover">
          </div>
          <div>
            <div class="text-sm text-gray-400">Artista</div>
            <h1 class="text-5xl font-bold gradient-text">{{ a.name }}</h1>
            <div class="text-gray-400 mt-2">{{ a.genre }} • {{ a.monthlyListeners | number }} oyentes mensuales</div>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold text-white mb-4">Top canciones</h2>
          <div class="glass-card">
            <div *ngFor="let s of topTracks; let i = index" class="flex items-center gap-4 p-4 border-b border-white/5 last:border-0">
              <div class="text-gray-500 w-6">{{ i + 1 }}</div>
              <div class="w-14 h-14 rounded-lg overflow-hidden">
                <img [src]="s.cover || getDefaultCover()" [alt]="s.title" class="w-full h-full object-cover">
              </div>
              <div class="flex-1">
                <div class="text-white font-medium">{{ s.title }}</div>
                <div class="text-gray-400 text-sm">{{ s.album || a.name }}</div>
              </div>
              <div class="text-gray-400 text-sm">{{ s.duration || '3:30' }}</div>
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-2xl font-bold text-white mb-4">Canciones</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div *ngFor="let s of tracks" class="neo-card p-4">
              <div class="w-full aspect-square rounded-xl overflow-hidden mb-3">
                <img [src]="s.cover || getDefaultCover()" [alt]="s.title" class="w-full h-full object-cover">
              </div>
              <div class="text-white font-semibold truncate">{{ s.title }}</div>
              <div class="text-xs text-gray-400 truncate">{{ s.album || a.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ArtistDetailComponent {
  artist: Artist | null = null;
  tracks: Song[] = [];
  topTracks: Song[] = [];

  constructor(private route: ActivatedRoute, private artistsService: ArtistsService) {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.artist = this.artistsService.getArtist(id);
    if (this.artist) {
      this.tracks = this.artistsService.getArtistTracks(id);
      this.topTracks = this.artistsService.getArtistTopTracks(id);
    }
  }

  getDefaultCover(): string {
    return 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg';
  }
}