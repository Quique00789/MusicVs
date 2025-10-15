import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sticky-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section [id]="'sticky-'+title" class="relative min-h-screen flex items-center py-32">
      <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center" [ngClass]="reverse ? 'md:flex-row-reverse' : ''">
        <div [attr.data-aos]="reverse ? 'fade-left' : 'fade-right'" data-aos-duration="1000">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">{{ title }}</h2>
          <p class="text-lg text-gray-300 leading-relaxed">{{ description }}</p>
        </div>

        <div class="sticky top-32" [ngStyle]="{ transform: 'scale(' + (0.8 + scrollProgress*0.2) + ') rotate(' + (scrollProgress*5) + 'deg)', opacity: 0.5 + scrollProgress*0.5 }">
          <div class="relative group">
            <div class="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <img [src]="imageUrl" alt="{{ title }}" class="relative w-full h-[420px] object-cover rounded-3xl shadow-2xl" />
          </div>
        </div>
      </div>
    </section>
  `
})
export class StickySectionComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() imageUrl = '';
  @Input() reverse = false;

  scrollProgress = 0;

  @HostListener('window:scroll') onScroll() {
    const section = document.getElementById('sticky-' + this.title);
    if (section) {
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / window.innerHeight));
      this.scrollProgress = progress;
    }
  }
}
