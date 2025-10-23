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
                     class="w-full h-full object-cover"
                     (error)="onImageError($event)">
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
                   class="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-all duration-300 group transform hover:scale-110"
                   [title]="social.displayName">
                  <div [innerHTML]="getSocialIcon(social.platform)" 
                       class="w-6 h-6 text-gray-400 group-hover:text-white transition-colors">
                  </div>
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
      this.artist = this.artistService.getArtistById(artistId) ?? null;
    });
  }
  
  goBack() {
    this.router.navigate(['/artists']);
  }
  
  onImageError(event: any) {
    // Si la imagen no se puede cargar, oculta el elemento img para que aparezca el fallback
    event.target.style.display = 'none';
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
      'instagram': `
        <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>`,
      'youtube': `
        <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>`,
      'spotify': `
        <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>`,
      'soundcloud': `
        <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path d="M3.06 13.055c-.084 0-.153-.012-.207-.036a.24.24 0 0 1-.12-.144.945.945 0 0 1-.024-.228c0-.096.012-.18.036-.252.024-.072.06-.132.108-.18a.24.24 0 0 1 .159-.072c.072 0 .132.024.18.072.048.048.084.108.108.18.024.072.036.156.036.252 0 .084-.012.156-.036.228a.265.265 0 0 1-.108.144c-.048.024-.108.036-.132.036zm-.024-1.2c-.036 0-.06.012-.084.036-.024.024-.036.06-.036.108v.588c0 .048.012.084.036.108.024.024.048.036.084.036.036 0 .06-.012.084-.036.024-.024.036-.06.036-.108v-.588c0-.048-.012-.084-.036-.108-.024-.024-.048-.036-.084-.036zm-.588.228c-.036 0-.06.012-.084.036-.024.024-.036.06-.036.108v.324c0 .048.012.084.036.108.024.024.048.036.084.036.036 0 .06-.012.084-.036.024-.024.036-.06.036-.108v-.324c0-.048-.012-.084-.036-.108-.024-.024-.048-.036-.084-.036zm1.176-.072c-.036 0-.06.012-.084.036-.024.024-.036.06-.036.108v.468c0 .048.012.084.036.108.024.024.048.036.084.036.036 0 .06-.012.084-.036.024-.024.036-.06.036-.108v-.468c0-.048-.012-.084-.036-.108-.024-.024-.048-.036-.084-.036zm.588-.132c-.036 0-.06.012-.084.036-.024.024-.036.06-.036.108v.732c0 .048.012.084.036.108.024.024.048.036.084.036.036 0 .06-.012.084-.036.024-.024.036-.06.036-.108v-.732c0-.048-.012-.084-.036-.108-.024-.024-.048-.036-.084-.036zm.588-.096c-.036 0-.06.012-.084.036-.024.024-.036.06-.036.108v.924c0 .048.012.084.036.108.024.024.048.036.084.036.036 0 .06-.012.084-.036.024-.024.036-.06.036-.108v-.924c0-.048-.012-.084-.036-.108-.024-.024-.048-.036-.084-.036zm.588-.06c-.036 0-.06.012-.084.036-.024.024-.036.06-.036.108v1.044c0 .048.012.084.036.108.024.024.048.036.084.036.036 0 .06-.012.084-.036.024-.024.036-.06.036-.108v-1.044c0-.048-.012-.084-.036-.108-.024-.024-.048-.036-.084-.036zm.588-.036c-.036 0-.06.012-.084.036-.024.024-.036.06-.036.108v1.116c0 .048.012.084.036.108.024.024.048.036.084.036.036 0 .06-.012.084-.036.024-.024.036-.06.036-.108v-1.116c0-.048-.012-.084-.036-.108-.024-.024-.048-.036-.084-.036zm.612-.036c-.048 0-.084.024-.108.072-.024.048-.036.096-.036.156v1.164c0 .06.012.108.036.156.024.048.06.072.108.072.048 0 .084-.024.108-.072.024-.048.036-.096.036-.156v-1.164c0-.06-.012-.108-.036-.156-.024-.048-.06-.072-.108-.072zm.624-.024c-.048 0-.084.024-.108.072-.024.048-.036.096-.036.156v1.212c0 .06.012.108.036.156.024.048.06.072.108.072.048 0 .084-.024.108-.072.024-.048.036-.096.036-.156v-1.212c0-.06-.012-.108-.036-.156-.024-.048-.06-.072-.108-.072zm.612.048c-.048 0-.084.024-.108.072-.024.048-.036.096-.036.156v1.116c0 .06.012.108.036.156.024.048.06.072.108.072.048 0 .084-.024.108-.072.024-.048.036-.096.036-.156v-1.116c0-.06-.012-.108-.036-.156-.024-.048-.06-.072-.108-.072zm.636.204c-.072 0-.132.036-.168.108-.036.072-.054.144-.054.228v.588c0 .084.018.156.054.228.036.072.096.108.168.108.072 0 .132-.036.168-.108.036-.072.054-.144.054-.228v-.588c0-.084-.018-.156-.054-.228-.036-.072-.096-.108-.168-.108zm8.4-.756c-.288 0-.564.06-.828.18-.264.12-.492.288-.684.504-.192.216-.348.468-.456.756-.108.288-.168.588-.168.9 0 .312.06.612.168.9.108.288.264.54.456.756.192.216.42.384.684.504.264.12.54.18.828.18s.564-.06.828-.18c.264-.12.492-.288.684-.504.192-.216.348-.468.456-.756.108-.288.168-.588.168-.9 0-.312-.06-.612-.168-.9-.108-.288-.264-.54-.456-.756-.192-.216-.42-.384-.684-.504-.264-.12-.54-.18-.828-.18z"/>
        </svg>`
    };
    return icons[platform.toLowerCase()] || `
      <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
        <circle cx="12" cy="12" r="10"/>
      </svg>`;
  }
}