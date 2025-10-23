import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Artist } from './models/artist.model';
import { ArtistService } from './services/artist.service';

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <!-- Header spacing -->
      <div class="pt-20"></div>
      
      <!-- Artists Section -->
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Artists</h1>
          <p class="text-gray-400 text-lg max-w-2xl mx-auto">Discover the talented artists behind your favorite tracks</p>
        </div>
        
        <!-- Artists Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let artist of artists" 
               class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer transform hover:scale-105"
               (click)="viewArtist(artist)">
            
            <!-- Artist Profile Image -->
            <div class="flex justify-center mb-6">
              <div class="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <img *ngIf="artist.profileImage; else noImage" 
                     [src]="artist.profileImage" 
                     [alt]="artist.name"
                     class="w-full h-full object-cover">
                <ng-template #noImage>
                  <span class="text-white text-3xl font-bold">{{ getInitials(artist.name) }}</span>
                </ng-template>
              </div>
            </div>
            
            <!-- Artist Info -->
            <div class="text-center">
              <h3 class="text-xl font-semibold text-white mb-2">{{ artist.name }}</h3>
              <p class="text-gray-400 mb-4">{{ artist.realName }}</p>
              <div class="flex flex-wrap justify-center gap-2 mb-4">
                <span *ngFor="let genre of artist.genres" 
                      class="bg-cyan-600/20 text-cyan-400 px-3 py-1 rounded-full text-sm">
                  {{ genre }}
                </span>
              </div>
              <p class="text-gray-300 text-sm mb-6 line-clamp-3">{{ artist.shortBio }}</p>
              
              <!-- Social Links -->
              <div class="flex justify-center gap-4 mb-6">
                <a *ngFor="let social of artist.socialLinks" 
                   [href]="social.url" 
                   target="_blank"
                   class="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
                  <svg class="w-5 h-5 text-white" [innerHTML]="getSocialIcon(social.platform)"></svg>
                </a>
              </div>
              
              <!-- Songs Count -->
              <div class="bg-gray-700/50 rounded-lg p-3">
                <span class="text-white font-semibold">{{ artist.songCount }}</span>
                <span class="text-gray-400 ml-1">{{ artist.songCount === 1 ? 'Track' : 'Tracks' }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="artists.length === 0" class="text-center py-20">
          <div class="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">No Artists Found</h3>
          <p class="text-gray-400">Check back later for new artists!</p>
        </div>
      </div>
    </div>
  `
})
export class ArtistsComponent implements OnInit {
  artists: Artist[] = [];
  
  constructor(
    private artistService: ArtistService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.loadArtists();
  }
  
  loadArtists() {
    this.artists = this.artistService.getAllArtists();
  }
  
  viewArtist(artist: Artist) {
    this.router.navigate(['/artist', artist.id]);
  }
  
  getInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  }
  
  getSocialIcon(platform: string): string {
    const icons: { [key: string]: string } = {
      'instagram': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c0 1.657 0 3-4 3s-4-1.343-4-3m4 3v-9M9 21c0-4.418 0-8 2-8s2 3.582 2 8"></path>',
      'youtube': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 011.5 1.5v0a1.5 1.5 0 01-1.5 1.5H9m3.5-6L12 6.5 10.5 8"></path>',
      'spotify': '<circle cx="12" cy="12" r="10"></circle><path d="M8.5 14.5c0-1 0-2 2-2s2 1 2 2-0 2-2 2-2-1-2-2z"></path><path d="M17 9c-1.5-1-4-1-5.5 0"></path><path d="M16 12c-1-0.5-3-0.5-4 0"></path>',
      'soundcloud': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"></path>'
    };
    return icons[platform.toLowerCase()] || '<circle cx="12" cy="12" r="10"></circle>';
  }
}