// src/app/services/smooth-scroll.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  private lenis: any = null;
  private gsap: any = null;
  private ScrollTrigger: any = null;
  private rafId: number | null = null;
  private isInitialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      void this.initialize();
    }
  }

  async initialize() {
    if (this.isInitialized || !isPlatformBrowser(this.platformId)) return;
    try {
      const [{ default: Lenis }, gsapModule] = await Promise.all([
        import('lenis'),
        import('gsap')
      ]);
      this.gsap = gsapModule && (gsapModule.default || gsapModule);
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      this.ScrollTrigger = ScrollTrigger;
      if (this.gsap && this.ScrollTrigger) this.gsap.registerPlugin(this.ScrollTrigger);

      // Lenis config tuned to avoid stalls and overscroll glitches
      this.lenis = new Lenis({
        duration: 1.0,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.1,
        touchMultiplier: 1.2,
        autoRaf: false
      } as any);

      // Single RAF loop managed here
      const loop = (time: number) => {
        this.lenis?.raf(time);
        this.ScrollTrigger?.update();
        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);

      // Scroller proxy for ScrollTrigger syncing
      const scroller = (document.scrollingElement || document.documentElement) as HTMLElement;
      this.ScrollTrigger?.scrollerProxy(scroller, {
        scrollTop: (value?: number) => {
          if (typeof value === 'number') {
            this.lenis?.scrollTo(value, { immediate: true });
          }
          return scroller.scrollTop || window.pageYOffset;
        },
        getBoundingClientRect: () => ({ top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }),
        pinType: scroller.style.transform ? 'transform' : 'fixed'
      });

      // Reduce refresh thrash: use event and debounce
      const debouncedRefresh = this.debounce(() => this.ScrollTrigger?.refresh(), 150);
      window.addEventListener('resize', debouncedRefresh, { passive: true });
      window.addEventListener('orientationchange', debouncedRefresh, { passive: true });

      // Guard against GSAP double RAF by disabling lag smoothing
      this.gsap.ticker?.lagSmoothing(0);

      this.isInitialized = true;
      this.ScrollTrigger?.refresh();
    } catch (e) {
      console.warn('SmoothScroll init failed', e);
    }
  }

  // Utility: debounce
  private debounce<T extends (...args: any[]) => void>(fn: T, wait: number) {
    let t: any;
    return (...args: any[]) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  // Public APIs
  scrollTo(target: string | number | HTMLElement, options?: any) {
    this.lenis?.scrollTo(target as any, { duration: 0.9, ...options });
  }

  pause() { this.lenis?.stop(); }
  resume() { this.lenis?.start(); }
  refresh() { this.ScrollTrigger?.refresh(); }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    try { this.lenis?.destroy(); } catch {}
    this.lenis = null;
    try { this.ScrollTrigger?.killAll?.(); } catch {}
    this.isInitialized = false;
  }
}
