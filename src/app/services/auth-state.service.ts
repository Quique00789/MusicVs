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
      const { data } = client.auth.onAuthStateChange((event, session) => {
        console.log('Auth state change:', event, session?.user?.id || 'none');
        
        const u = session?.user ?? null;
        // Ensure change detection runs: re-enter Angular zone
        this.zone.run(() => {
          this.setUser(u);
        });
      });
      
      // Store subscription for cleanup if needed
      console.log('Auth state listener set up');
    } catch (e) {
      console.error('Error setting up auth state listener:', e);
    }

    this.initialized = true;
  }

  private setUser(u: any) {
    const changed = this.user?.id !== u?.id;
    this.user = u;
    
    if (changed) {
      console.log('User state changed:', u?.id || 'none');
    }
    
    // Notify all subscribers
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
    return () => this.subs.delete(cb);
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
      
      // Force user state to null immediately
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
    
    try {
      const u = await this.supabase.getCurrentUser();
      this.setUser(u);
    } catch (e) {
      console.warn('Error refreshing user state:', e);
    }
  }
}