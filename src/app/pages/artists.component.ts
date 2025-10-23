import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ArtistsService, Artist } from '../services/artists.service';

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen pt-24 pb-24 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="mb-10 flex items-end justify-between">
          <div>
            <h1 class="text-5xl font-bold gradient-text">Artists</h1>
            <p class="text-gray-400 mt-2">Explora artistas populares y descubre nueva música</p>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div *ngFor="let a of artists" class="glass-card p-4 hover:scale-[1.02] cursor-pointer transition-smooth" (click)="openArtist(a)">
            <div class="w-full aspect-square rounded-2xl overflow-hidden mb-3">
              <img [src]="a.image || getDefaultCover()" [alt]="a.name" class="w-full h-full object-cover">
            </div>
            <div class="text-white font-semibold truncate">{{ a.name }}</div>
            <div class="text-xs text-gray-400 truncate">{{ a.genre || 'Artista' }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ArtistsComponent implements OnInit {
  artists: Artist[] = [];

  constructor(private artistsService: ArtistsService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.artists = this.artistsService.getTopArtists(30);
    this.cdr.detectChanges();
  }

  openArtist(a: Artist) {
    this.router.navigate(['/artist', a.id]);
  }

  getDefaultCover(): string {
    return 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg';
  }
}