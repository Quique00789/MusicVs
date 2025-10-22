import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

type Subscriber = (user: any) => void;

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private user: any = null;
  private subs = new Set<Subscriber>();

  constructor(private supabase: SupabaseService) {
    this.init();
  }

  private async init() {
    // populate initial user
    try {
      const u = await this.supabase.getCurrentUser();
      this.setUser(u);
    } catch (e) {
      // ignore
    }

    // Subscribe to auth changes
    const client = this.supabase.getClient();
    try {
      // supabase-js v2: onAuthStateChange
      (client.auth as any).onAuthStateChange((event: any, session: any) => {
        const u = session?.user ?? null;
        this.setUser(u);
      });
    } catch (e) {
      // ignore
    }
  }

  private setUser(u: any) {
    this.user = u;
    for (const s of this.subs) s(u);
  }

  subscribe(cb: Subscriber) {
    this.subs.add(cb);
    // immediate call
    cb(this.user);
    return () => this.subs.delete(cb);
  }

  async signOut() {
    try {
      await this.supabase.signOut();
      this.setUser(null);
    } catch (e) {
      console.warn('signOut failed', e);
    }
  }
}
