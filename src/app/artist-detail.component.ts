import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Artist } from './models/artist.model';
import { ArtistService } from './services/artist.service';
import { Song } from './models/song';
import { songs as allSongs } from './data/songs';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <div class="pt-20"></div>
      
      <div *ngIf="artist; else notFound" class="max-w-6xl mx-auto px-6 py-12">
        <button (click)="goBack()" class="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group">
          <svg class="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          <span>Back to Artists</span>
        </button>
        
        <div class="bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 rounded-2xl p-8 md:p-12 mb-12">
          <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div class="flex-shrink-0">
              <div class="w-48 h-48 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <img *ngIf="artist.profileImage; else noImage" [src]="artist.profileImage" [alt]="artist.name" class="w-full h-full object-cover" (error)="onImageError($event)">
                <ng-template #noImage>
                  <span class="text-white text-6xl font-bold">{{ getInitials(artist.name) }}</span>
                </ng-template>
              </div>
            </div>
            
            <div class="flex-1 text-center md:text-left">
              <div class="flex items-center justify-center md:justify-start gap-3 mb-4">
                <h1 class="text-4xl md:text-5xl font-bold text-white">{{ artist.name }}</h1>
                <svg *ngIf="artist.verified" class="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </div>
              <h2 *ngIf="artist.realName" class="text-xl text-gray-300 mb-4">{{ artist.realName }}</h2>
              <div class="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                <span *ngFor="let genre of artist.genres" class="bg-cyan-600/30 text-cyan-300 px-4 py-2 rounded-full text-sm font-medium">{{ genre }}</span>
              </div>
              <div class="flex items-center justify-center md:justify-start gap-4 mb-6">
                <div class="flex items-center gap-2 text-gray-300">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span>{{ artist.country }}</span>
                </div>
                <div class="flex items-center gap-2 text-gray-300">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13"/></svg>
                  <span>{{ artist.songCount }} {{ artist.songCount === 1 ? 'Track' : 'Tracks' }}</span>
                </div>
              </div>
              <div class="flex justify-center md:justify-start gap-4">
                <a *ngFor="let social of artist.socialLinks" [href]="social.url" target="_blank" class="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-all duration-300 group transform hover:scale-110" [title]="social.displayName">
                  <div class="w-6 h-6 text-gray-400 group-hover:text-white transition-colors flex items-center justify-center">
                    <div [innerHTML]="getSocialIcon(social.platform)"></div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Popular Tracks -->
        <div class="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-white">Popular Tracks</h3>
            <span class="text-gray-400">{{ popularTracks.length }} tracks</span>
          </div>

          <div *ngIf="popularTracks.length; else noTracks" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div *ngFor="let track of popularTracks" class="flex items-center gap-4 bg-gray-900/40 rounded-lg p-4 hover:bg-gray-900/60 transition-colors">
              <div class="w-14 h-14 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center">
                <img *ngIf="track.cover" [src]="track.cover" [alt]="track.title" class="w-full h-full object-cover">
                <svg *ngIf="!track.cover" class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13"/></svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-white font-medium truncate">{{ track.title }}</div>
                <div class="text-gray-400 text-sm truncate">{{ track.album || 'Single' }}</div>
              </div>
              <div class="text-gray-400 text-sm">{{ track.duration }}</div>
              <button class="ml-2 p-2 rounded-full bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 transition-colors" (click)="$event.stopPropagation(); play(track)">▶</button>
            </div>
          </div>

          <ng-template #noTracks>
            <div class="text-center py-8 text-gray-400">No tracks available</div>
          </ng-template>
        </div>
      </div>

      <ng-template #notFound>
        <div class="max-w-2xl mx-auto px-6 py-20 text-center">
          <div class="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </div>
          <h2 class="text-2xl font-bold text-white mb-4">Artist Not Found</h2>
          <p class="text-gray-400 mb-8">The artist you're looking for doesn't exist.</p>
          <button (click)="goBack()" class="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition-colors">Back to Artists</button>
        </div>
      </ng-template>
    </div>
  `
})
export class ArtistDetailComponent implements OnInit {
  artist: Artist | null = null;
  popularTracks: Song[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private artistService: ArtistService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const artistId = params['id'];
      this.artist = this.artistService.getArtistById(artistId) ?? null;
      this.loadPopularTracks();
    });
  }

  loadPopularTracks() {
    if (!this.artist) { this.popularTracks = []; return; }
    const artistName = this.artist.name.toLowerCase();
    this.popularTracks = allSongs.filter(s => s.artist.toLowerCase() === artistName);
  }

  play(track: Song) {
    console.log('Play track:', track.title);
  }

  goBack() { this.router.navigate(['/artists']); }
  onImageError(event: any) { event.target.style.display = 'none'; }
  getInitials(name: string): string { return name.split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase(); }

  getSocialIcon(platform: string): string {
    const icons: { [key: string]: string } = {
      instagram: `<svg viewBox='0 0 24 24' fill='currentColor' class='w-6 h-6'><path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 3.675A6.162 6.162 0 1018.162 12 6.17 6.17 0 0012 5.838z'/></svg>`,
      youtube: `<svg viewBox='0 0 24 24' fill='currentColor' class='w-6 h-6'><path d='M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'/></svg>`,
      spotify: `<svg viewBox='0 0 24 24' fill='currentColor' class='w-6 h-6'><path d='M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z'/></svg>`,
      soundcloud: `<svg viewBox='0 0 24 24' fill='currentColor' class='w-6 h-6'><path d='M3.06 13.055c-.084 0-.153-.012-.207-.036a.24.24 0 01-.12-.144.945.945 0 01-.024-.228c0-.096.012-.18.036-.252.024-.072.06-.132.108-.18a.24.24 0 01.159-.072c.072 0 .132.024.18.072.048.048.084.108.108.18.024.072.036.156.036.252 0 .084-.012.156-.036.228a.265.265 0 01-.108.144c-.048.024-.108.036-.132.036z'/></svg>`
    };
    return icons[platform.toLowerCase()] || `<svg viewBox='0 0 24 24' fill='currentColor' class='w-6 h-6'><circle cx='12' cy='12' r='10'/></svg>`;
  }
}
