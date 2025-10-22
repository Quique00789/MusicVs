import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

bootstrapApplication(App, appConfig)
  .then(async () => {
    // Remove FOUC hiding: mark body as loaded so CSS shows content
    try {
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.add('loaded');
      }
    } catch (e) {
      // ignore in non-browser environments
    }
    // Client-only: initialize Lenis (smooth scroll) and GSAP ScrollTrigger
    if (typeof window !== 'undefined') {
      // Handle Supabase OAuth redirect fragments (e.g. #access_token=...)
      try {
        if (window.location.hash && /access_token|error|provider_token/.test(window.location.hash)) {
          // Dynamic import supabase client to parse and store session from URL
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseForRedirect = createClient(environment.supabase.url, environment.supabase.anonKey);
          try {
            // Prefer SDK helper if available
            const authAny = (supabaseForRedirect.auth as any);
            if (typeof authAny.getSessionFromUrl === 'function') {
              await authAny.getSessionFromUrl({ storeSession: true });
            } else {
              // Fallback: parse fragment and set session manually
              const hash = window.location.hash.substring(1);
              const params = Object.fromEntries(new URLSearchParams(hash));
              const access_token = params['access_token'];
              const refresh_token = params['refresh_token'];
              if (access_token) {
                try {
                  if (typeof authAny.setSession === 'function') {
                    await authAny.setSession({ access_token, refresh_token });
                  } else {
                    // last resort: write tokens to localStorage in Supabase format
                    try {
                      const session = { access_token, refresh_token };
                      localStorage.setItem('sb:token', JSON.stringify(session));
                    } catch (e) {
                      // ignore
                    }
                  }
                } catch (e) {
                  console.warn('setSession fallback error', e);
                }
              }
            }
          } catch (e) {
            // ignore errors here; we'll still try to clean the URL
            console.warn('getSessionFromUrl/setSession error', e);
          }

          // Remove fragment from URL and reload to root so the SPA boots with the stored session
          try {
            // Replace history to remove fragment first
            history.replaceState(null, '', window.location.pathname + window.location.search);
          } catch (e) {
            /* ignore */
          }

          try {
            // Force reload to root to ensure the app picks up the stored session
            window.location.replace(window.location.origin + '/');
          } catch (e) {
            // fallback: full reload
            window.location.reload();
          }
        }
      } catch (e) {
        // ignore top-level errors
      }

      // Initialize Lenis and GSAP ScrollTrigger (dynamic imports)
      (async () => {
        try {
          const [{ default: Lenis }, gsapModule] = await Promise.all([
            import('lenis'),
            import('gsap')
          ]);

          const gsap: any = (gsapModule && (gsapModule.default || gsapModule));
          const { ScrollTrigger } = await import('gsap/ScrollTrigger');
          if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

          const lenis = new Lenis({
            duration: 0.8,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            orientation: 'vertical'
          });

          function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
          }
          requestAnimationFrame(raf);

          const scroller = (document.scrollingElement || document.documentElement) as HTMLElement;
          (ScrollTrigger as any).scrollerProxy(scroller, {
            scrollTop(value?: number) {
              if (arguments.length) {
                lenis.scrollTo(value as number);
                return;
              }
              return scroller.scrollTop || window.pageYOffset;
            },
            getBoundingClientRect() {
              return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
            },
            pinType: (scroller.style && scroller.style.transform) ? 'transform' : 'fixed'
          });

          if (lenis && typeof lenis.on === 'function') {
            lenis.on('scroll', () => ScrollTrigger.update());
          }

          ScrollTrigger.refresh();
        } catch (err) {
          console.warn('Lenis/GSAP failed to initialize', err);
        }
      })();
    }
  })
  .catch((err) => console.error(err));
