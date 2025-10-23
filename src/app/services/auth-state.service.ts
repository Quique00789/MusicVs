import { Injectable, NgZone, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SupabaseService } from './supabase.service';

type Subscriber = (user: any) => void;

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private user: any = null;
  private subs = new Set<Subscriber>();
  private initialized = false;
  private isBrowser: boolean;
  private authSubscription: any = null;

  constructor(
    private supabase: SupabaseService, 
    private zone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.init();
    }
  }

  private async init() {
    if (this.initialized || !this.isBrowser) return;

    try {
      // Get initial user state
      const u = await this.supabase.getCurrentUser();
      this.setUser(u);
      
      console.log('AuthState initialized with user:', u?.id || 'none');
    } catch (e) {
      console.warn('Error getting initial user:', e);
      this.setUser(null);
    }

    // Set up auth state change listener
    const client = this.supabase.getClient();
    try {
      this.authSubscription = client.auth.onAuthStateChange((event, session) => {
        console.log('Auth state change event:', event, 'User:', session?.user?.id || 'none');
        
        const u = session?.user ?? null;
        
        // Always run in Angular zone to ensure UI updates
        this.zone.run(() => {
          this.setUser(u);
        });
      });
      
      console.log('Auth state listener set up successfully');
    } catch (e) {
      console.error('Error setting up auth state listener:', e);
    }

    this.initialized = true;
  }

  private setUser(u: any) {
    const userChanged = this.user?.id !== u?.id;
    const oldUser = this.user;
    this.user = u;
    
    if (userChanged) {
      console.log('User state changed from:', oldUser?.id || 'none', 'to:', u?.id || 'none');
      console.log('Notifying', this.subs.size, 'subscribers');
    }
    
    // Notify all subscribers immediately
    for (const s of this.subs) {
      try {
        s(u);
      } catch (error) {
        console.error('Error in auth state subscriber:', error);
      }
    }
  }

  subscribe(cb: Subscriber) {
    this.subs.add(cb);
    // Immediately call with current user state
    cb(this.user);
    
    console.log('New subscriber added. Total subscribers:', this.subs.size);
    
    return () => {
      this.subs.delete(cb);
      console.log('Subscriber removed. Remaining subscribers:', this.subs.size);
    };
  }

  getCurrentUser() { 
    return this.user; 
  }
  
  isLoggedIn(): boolean { 
    return !!this.user; 
  }

  async signOut() {
    try {
      console.log('AuthState: signing out...');
      await this.supabase.signOut();
      
      // The auth state change listener will handle setting user to null
      // But we can also force it immediately
      this.zone.run(() => {
        this.setUser(null);
      });
      
      console.log('AuthState: signed out successfully');
      return true;
    } catch (e) {
      console.error('AuthState: error during signOut:', e);
      
      // Even if signOut fails, clear local state
      this.zone.run(() => {
        this.setUser(null);
      });
      
      throw e;
    }
  }

  // Method to manually refresh user state (useful after external auth operations)
  async refreshUserState() {
    if (!this.isBrowser) return;
    
    console.log('Manually refreshing user state...');
    
    try {
      const u = await this.supabase.getCurrentUser();
      
      // Force update in Angular zone
      this.zone.run(() => {
        this.setUser(u);
      });
      
      console.log('User state refreshed:', u?.id || 'none');
    } catch (e) {
      console.warn('Error refreshing user state:', e);
    }
  }

  // Force an immediate update - useful when we know the state has changed
  forceUpdate() {
    this.zone.run(() => {
      // Re-trigger all subscribers with current user
      for (const s of this.subs) {
        try {
          s(this.user);
        } catch (error) {
          console.error('Error in forced auth state update:', error);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.data?.subscription?.unsubscribe();
    }
  }
}