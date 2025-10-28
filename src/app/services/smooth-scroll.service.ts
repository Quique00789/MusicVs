import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  private lenis: any = null;
  private gsap: any = null;
  private ScrollTrigger: any = null;
  private isInitialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeScrollLibraries();
    }
  }

  private async initializeScrollLibraries() {
    if (this.isInitialized) return;

    try {
      const [{ default: Lenis }, gsapModule] = await Promise.all([
        import('lenis'),
        import('gsap')
      ]);

      this.gsap = gsapModule && (gsapModule.default || gsapModule);
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      this.ScrollTrigger = ScrollTrigger;
      if (this.gsap && this.ScrollTrigger) this.gsap.registerPlugin(this.ScrollTrigger);

      // Propiedades válidas para Lenis
      this.lenis = new Lenis({
        duration: 0.8,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        orientation: 'vertical'
      });

      const raf = (time: number) => {
        this.lenis?.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);

      if (this.ScrollTrigger && this.lenis) {
        const scroller = (document.scrollingElement || document.documentElement) as HTMLElement;
        this.ScrollTrigger.scrollerProxy(scroller, {
          scrollTop: (value?: number) => {
            if (arguments.length) {
              this.lenis.scrollTo(value as number);
              return;
            }
            return scroller.scrollTop || window.pageYOffset;
          },
          getBoundingClientRect: () => ({ top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }),
          pinType: (scroller.style && scroller.style.transform) ? 'transform' : 'fixed'
        });

        if (typeof this.lenis.on === 'function') {
          this.lenis.on('scroll', () => this.ScrollTrigger.update());
        }
        this.ScrollTrigger.refresh();
      }

      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize smooth scroll:', error);
    }
  }
}
