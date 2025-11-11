import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="hero relative flex items-center justify-center overflow-hidden">
      <div class="hero-overlay"></div>

      <div class="relative z-10 text-center px-6" [ngStyle]="{ transform: 'scale(' + scale + ')', opacity: opacity }">
        <h1 class="text-6xl md:text-7xl lg:text-9xl font-extrabold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent" data-aos="fade-down" data-aos-duration="1000">Feel The Music</h1>

        <p class="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000">
          Immerse yourself in a world of sound. Discover, play, and enjoy millions of songs.
        </p>

        <button 
          (click)="scrollToTrending()"
          class="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105" 
          data-aos="zoom-in" 
          data-aos-delay="400" 
          data-aos-duration="1000">
          <span class="relative z-10 flex items-center gap-2">Start Listening</span>
        </button>
      </div>

      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div class="w-6 h-10 border-2 border-white/12 rounded-full flex items-start justify-center p-2">
          <div class="w-1 h-2 bg-white/30 rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  `
})
export class HeroComponent {
  scrollY = 0;
  get scale() { return Math.max(0.5, 1 - this.scrollY / 1000); }
  get opacity() { return Math.max(0, 1 - this.scrollY / 500); }

  @HostListener('window:scroll') onScroll() {
    this.scrollY = window.scrollY || 0;
  }

  scrollToTrending() {
    const heroHeight = window.innerHeight;
    window.scrollTo({
      top: heroHeight,
      behavior: 'smooth'
    });
  }
}
