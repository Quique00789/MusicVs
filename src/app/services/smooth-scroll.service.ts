// src/app/services/smooth-scroll.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  private lenis: any = null;
  private gsap: any = null;
  private ScrollTrigger: any = null;
  private isInitialized = false;
  private pendingScrollCallbacks: Array<(e: any) => void> = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeScrollLibraries();
    }
  }

  private async initializeScrollLibraries() {
    if (this.isInitialized) return;

    try {
      // Dynamic imports para evitar errores de SSR
      const [{ default: Lenis }, gsapModule] = await Promise.all([
        import('lenis'),
        import('gsap')
      ]);

      this.gsap = gsapModule && (gsapModule.default || gsapModule);
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      this.ScrollTrigger = ScrollTrigger;
      
      if (this.gsap && this.ScrollTrigger) {
        this.gsap.registerPlugin(this.ScrollTrigger);
      }

      // Configuración de Lenis con propiedades válidas
      this.lenis = new Lenis({
        duration: 0.8,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  // Desactivar smoothWheel en la rueda/trackpad para evitar comportamiento pegajoso
  smoothWheel: false,
        orientation: 'vertical'
      });

      // Registrar callbacks pendientes si los hay
      if (this.pendingScrollCallbacks.length && this.lenis) {
        this.pendingScrollCallbacks.forEach(cb => {
          try { this.lenis.on('scroll', cb); } catch (e) { /* ignore */ }
        });
        this.pendingScrollCallbacks = [];
      }

      // RAF loop para Lenis
      const raf = (time: number) => {
        if (this.lenis) {
          this.lenis.raf(time);
        }
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);

      // Configuración de ScrollTrigger con Lenis
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
          getBoundingClientRect: () => {
            return { 
              top: 0, 
              left: 0, 
              width: window.innerWidth, 
              height: window.innerHeight 
            };
          },
          pinType: (scroller.style && scroller.style.transform) ? 'transform' : 'fixed'
        });

        // Sincronizar Lenis con ScrollTrigger
        this.lenis.on('scroll', () => {
          this.ScrollTrigger.update();
        });

        // Refresh ScrollTrigger
        this.ScrollTrigger.refresh();
      }

      this.isInitialized = true;
      console.log('Smooth scroll libraries initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize smooth scroll libraries:', error);
    }
  }

  // Permite que componentes se suscriban al evento de scroll de Lenis.
  // Devuelve una función para desuscribirse.
  onScroll(cb: (e: any) => void): () => void {
    if (!isPlatformBrowser(this.platformId)) return () => {};

    if (this.lenis) {
      try {
        this.lenis.on('scroll', cb);
      } catch (e) {
        // ignore
      }

      return () => {
        try { this.lenis.off && this.lenis.off('scroll', cb); } catch (e) { /* ignore */ }
      };
    }

    // Si lenis aún no está inicializado, almacenar callback para registrarlo después
    this.pendingScrollCallbacks.push(cb);
    return () => {
      const i = this.pendingScrollCallbacks.indexOf(cb);
      if (i >= 0) this.pendingScrollCallbacks.splice(i, 1);
    };
  }

  // Método para scroll suave a elemento específico
  scrollTo(target: string | number | HTMLElement, options?: any) {
    if (!this.lenis || !isPlatformBrowser(this.platformId)) return;

    const defaultOptions = {
      offset: 0,
      duration: 1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      immediate: false,
      ...options
    };

    this.lenis.scrollTo(target, defaultOptions);
  }

  // Método para pausar/reanudar el scroll suave
  toggleScroll(enabled: boolean = true) {
    if (!this.lenis) return;
    
    if (enabled) {
      this.lenis.start();
    } else {
      this.lenis.stop();
    }
  }

  // Método para obtener la posición actual del scroll
  getCurrentScroll(): number {
    if (!this.lenis) return 0;
    return this.lenis.scroll || 0;
  }

  // Método para refresh de ScrollTrigger
  refreshScrollTrigger() {
    if (this.ScrollTrigger) {
      this.ScrollTrigger.refresh();
    }
  }

  // Método para crear animaciones GSAP con ScrollTrigger
  createScrollAnimation(element: string | HTMLElement, animation: any, triggerOptions?: any) {
    if (!this.gsap || !this.ScrollTrigger || !isPlatformBrowser(this.platformId)) {
      return null;
    }

    const defaultTriggerOptions = {
      trigger: element,
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
      ...triggerOptions
    };

    return this.gsap.timeline({
      scrollTrigger: defaultTriggerOptions
    }).add(animation);
  }

  // Método para animaciones de entrada fade-in-up
  fadeInUp(elements: string | HTMLElement[], options?: any) {
    if (!this.gsap || !isPlatformBrowser(this.platformId)) return;

    const defaultOptions = {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
      ...options
    };

    const elementsArray = Array.isArray(elements) ? elements : [elements];
    
    elementsArray.forEach((element, index) => {
      this.gsap.fromTo(element, 
        { y: defaultOptions.y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: defaultOptions.duration,
          delay: index * defaultOptions.stagger,
          ease: defaultOptions.ease,
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }

  // Método para destroy (cleanup)
  destroy() {
    if (this.lenis) {
      this.lenis.destroy();
      this.lenis = null;
    }
    
    if (this.ScrollTrigger) {
      this.ScrollTrigger.killAll();
    }
    
    this.isInitialized = false;
  }

  // Getter para verificar si está inicializado
  get initialized(): boolean {
    return this.isInitialized;
  }
}
