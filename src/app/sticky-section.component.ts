import { Component, Input, OnDestroy, AfterViewInit, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-sticky-section',
  standalone: true,
  imports: [CommonModule],
  template: `
  <section #sectionRef [id]="'sticky-'+title" class="relative min-h-screen flex items-center py-32">
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
export class StickySectionComponent implements AfterViewInit, OnDestroy {
  @Input() title = '';
  @Input() description = '';
  @Input() imageUrl = '';
  @Input() reverse = false;
  @ViewChild('sectionRef', { static: false }) sectionRef!: ElementRef<HTMLElement>;

  scrollProgress = 0;
  private rafId: number | null = null;
  private isBrowser = false;
  private _onScroll: (() => void) | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this._onScroll = () => this.updateProgress();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return; // Evitar requestAnimationFrame en SSR
    // Suscribirse al scroll nativo para actualizar el progreso sin Lenis
    this.updateProgress(); // valor inicial
    try {
      window.addEventListener('scroll', this._onScroll as EventListener, { passive: true });
    } catch (e) {
      // ignore in non-browser or restricted envs
    }
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    try {
      if (this._onScroll) {
        window.removeEventListener('scroll', this._onScroll as EventListener);
        this._onScroll = null;
      }
    } catch (e) { /* ignore */ }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private updateProgress() {
    const sectionEl = this.sectionRef?.nativeElement || document.getElementById('sticky-' + this.title);
    if (!sectionEl) return;

    // getBoundingClientRect sigue funcionando con Lenis cuando ScrollTrigger scrollerProxy está configurado
    const rect = sectionEl.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / window.innerHeight));
    this.scrollProgress = progress;
  }
}
