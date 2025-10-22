// Minimal module declarations to satisfy TypeScript until proper types are available
declare module 'lenis' {
  interface LenisOptions {
    duration?: number;
    easing?: (t: number) => number;
    smoothWheel?: boolean;
    orientation?: 'vertical' | 'horizontal';
  }
  class Lenis {
    constructor(opts?: LenisOptions);
    raf(time: number): void;
    on(event: string, cb: (...args: any[]) => void): void;
    scrollTo(value: number | string, options?: any): void;
  }
  export default Lenis;
}

declare module 'gsap' {
  const gsap: any;
  export default gsap;
}

declare module 'gsap/ScrollTrigger' {
  export const ScrollTrigger: any;
}
