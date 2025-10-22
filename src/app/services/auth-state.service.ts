import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

type Subscriber = (user: any) => void;

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private user: any = null;
  private subs = new Set<Subscriber>();
  private initialized = false;

  constructor(private supabase: SupabaseService) {
    this.init();
  }

  private async init() {
    if (this.initialized) return;
    
    // Populate initial user
    try {
      const u = await this.supabase.getCurrentUser();
      this.setUser(u);
    } catch (e) {
      console.warn('Error getting initial user:', e);
      this.setUser(null);
    }

    // Subscribe to auth changes
    const client = this.supabase.getClient();
    try {
      // supabase-js v2: onAuthStateChange
      (client.auth as any).onAuthStateChange((event: any, session: any) => {
        const u = session?.user ?? null;
        console.log('Auth state changed:', event, u ? 'User logged in' : 'User logged out');
        this.setUser(u);
      });
    } catch (e) {
      console.warn('Error setting up auth state listener:', e);
    }

    this.initialized = true;
  }

  private setUser(u: any) {
    const wasLoggedIn = !!this.user;
    const isNowLoggedIn = !!u;
    
    this.user = u;
    
    // Log state changes for debugging
    if (wasLoggedIn && !isNowLoggedIn) {
      console.log('User logged out');
    } else if (!wasLoggedIn && isNowLoggedIn) {
      console.log('User logged in:', u.email);
    }
    
    // Notify all subscribers
    for (const s of this.subs) {
      try {
        s(u);
      } catch (e) {
        console.warn('Error in auth state subscriber:', e);
      }
    }
  }

  subscribe(cb: Subscriber) {
    this.subs.add(cb);
    // Immediate call with current state
    try {
      cb(this.user);
    } catch (e) {
      console.warn('Error in immediate auth state callback:', e);
    }
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
      console.log('Signing out user...');
      await this.supabase.signOut();
      
      // Clear user state immediately
      this.setUser(null);
      
      // Clear any stored session data
      if (typeof window !== 'undefined') {
        try {
          // Clear localStorage keys that might contain session data
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (e) {
          console.warn('Error clearing localStorage:', e);
        }
      }
      
      console.log('User signed out successfully');
      return true;
    } catch (e) {
      console.error('signOut failed:', e);
      // Even if the API call fails, clear local state
      this.setUser(null);
      throw e;
    }
  }

  async refreshSession() {
    try {
      const client = this.supabase.getClient();
      const { data, error } = await (client.auth as any).refreshSession();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('Session refresh failed:', e);
      this.setUser(null);
      throw e;
    }
  }
}