import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Artist } from './models/artist.model';
import { ArtistService } from './services/artist.service';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <!-- Header spacing -->
      <div class="pt-20"></div>
      
      <div *ngIf="artist; else notFound" class="max-w-6xl mx-auto px-6 py-12">
        <!-- Back Button -->
        <button (click)="goBack()" 
                class="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group">
          <svg class="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          <span>Back to Artists</span>
        </button>
        
        <!-- Artist Hero Section -->
        <div class="bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 rounded-2xl p-8 md:p-12 mb-12">
          <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
            <!-- Profile Image -->
            <div class="flex-shrink-0">
              <div class="w-48 h-48 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <img *ngIf="artist.profileImage; else noImage" 
                     [src]="artist.profileImage" 
                     [alt]="artist.name"
                     class="w-full h-full object-cover">
                <ng-template #noImage>
                  <span class="text-white text-6xl font-bold">{{ getInitials(artist.name) }}</span>
                </ng-template>
              </div>
            </div>
            
            <!-- Artist Info -->
            <div class="flex-1 text-center md:text-left">
              <div class="flex items-center justify-center md:justify-start gap-3 mb-4">
                <h1 class="text-4xl md:text-5xl font-bold text-white">{{ artist.name }}</h1>
                <svg *ngIf="artist.verified" class="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              
              <h2 *ngIf="artist.realName" class="text-xl text-gray-300 mb-4">{{ artist.realName }}</h2>
              
              <div class="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                <span *ngFor="let genre of artist.genres" 
                      class="bg-cyan-600/30 text-cyan-300 px-4 py-2 rounded-full text-sm font-medium">
                  {{ genre }}
                </span>
              </div>
              
              <div class="flex items-center justify-center md:justify-start gap-4 mb-6">
                <div class="flex items-center gap-2 text-gray-300">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>{{ artist.country }}</span>
                </div>
                <div class="flex items-center gap-2 text-gray-300">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13"></path>
                  </svg>
                  <span>{{ artist.songCount }} {{ artist.songCount === 1 ? 'Track' : 'Tracks' }}</span>
                </div>
              </div>
              
              <!-- Social Links -->
              <div class="flex justify-center md:justify-start gap-4">
                <a *ngFor="let social of artist.socialLinks" 
                   [href]="social.url" 
                   target="_blank"
                   class="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors group"
                   [title]="social.displayName">
                  <svg class="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" 
                       [innerHTML]="getSocialIcon(social.platform)"></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Artist Biography -->
        <div class="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 mb-8">
          <h3 class="text-2xl font-bold text-white mb-6">About {{ artist.name }}</h3>
          <div class="prose prose-invert max-w-none">
            <p *ngFor="let paragraph of getBioParagraphs()" 
               class="text-gray-300 leading-relaxed mb-4 last:mb-0">
              {{ paragraph }}
            </p>
          </div>
        </div>
        
        <!-- Songs Section (Placeholder) -->
        <div class="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-white">Popular Tracks</h3>
            <span class="text-gray-400">{{ artist.songCount }} tracks</span>
          </div>
          
          <!-- Placeholder for songs - esto se puede integrar con el sistema de canciones existente -->
          <div class="text-center py-12">
            <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13"></path>
              </svg>
            </div>
            <p class="text-gray-400">Songs will be displayed here soon!</p>
            <p class="text-gray-500 text-sm mt-2">Integration with existing song system pending</p>
          </div>
        </div>
      </div>
      
      <!-- Not Found Template -->
      <ng-template #notFound>
        <div class="max-w-2xl mx-auto px-6 py-20 text-center">
          <div class="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white mb-4">Artist Not Found</h2>
          <p class="text-gray-400 mb-8">The artist you're looking for doesn't exist.</p>
          <button (click)="goBack()" 
                  class="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition-colors">
            Back to Artists
          </button>
        </div>
      </ng-template>
    </div>
  `
})
export class ArtistDetailComponent implements OnInit {
  artist: Artist | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private artistService: ArtistService
  ) {}
  
  ngOnInit() {
    this.route.params.subscribe(params => {
      const artistId = params['id'];
      this.artist = this.artistService.getArtistById(artistId);
    });
  }
  
  goBack() {
    this.router.navigate(['/artists']);
  }
  
  getInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  }
  
  getBioParagraphs(): string[] {
    if (!this.artist) return [];
    return this.artist.bio.split('\n\n').filter(p => p.trim().length > 0);
  }
  
  getSocialIcon(platform: string): string {
    const icons: { [key: string]: string } = {
      'instagram': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 11-8 0 4 4 0 018 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>',
      'youtube': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 011.5 1.5v0a1.5 1.5 0 01-1.5 1.5H9m3.5-6L12 6.5 10.5 8"></path>',
      'spotify': '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"></circle><path d="M8 14.5c2-1 4-1 6 0M8 11c3-1.5 6-1.5 9 0M8.5 17c1.5-.5 3-.5 4.5 0" stroke="currentColor" stroke-width="1.5" fill="none"></path>',
      'soundcloud': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"></path>'
    };
    return icons[platform.toLowerCase()] || '<circle cx="12" cy="12" r="10"></circle>';
  }
}