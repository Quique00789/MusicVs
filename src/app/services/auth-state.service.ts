import { Injectable, NgZone } from '@angular/core';
import { SupabaseService } from './supabase.service';

type Subscriber = (user: any) => void;

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private user: any = null;
  private subs = new Set<Subscriber>();
  private initialized = false;

  constructor(private supabase: SupabaseService, private zone: NgZone) {
    this.init();
  }

  private async init() {
    if (this.initialized) return;

    try {
      const u = await this.supabase.getCurrentUser();
      this.setUser(u);
    } catch (e) {
      this.setUser(null);
    }

    const client = this.supabase.getClient();
    try {
      (client.auth as any).onAuthStateChange((event: any, session: any) => {
        const u = session?.user ?? null;
        // Ensure change detection runs: re-enter Angular zone
        this.zone.run(() => this.setUser(u));
      });
    } catch (e) {}

    this.initialized = true;
  }

  private setUser(u: any) {
    this.user = u;
    for (const s of this.subs) s(u);
  }

  subscribe(cb: Subscriber) {
    this.subs.add(cb);
    cb(this.user);
    return () => this.subs.delete(cb);
  }

  getCurrentUser() { return this.user; }
  isLoggedIn(): boolean { return !!this.user; }

  async signOut() {
    try {
      await this.supabase.signOut();
      // Force into Angular zone to trigger UI updates right away
      this.zone.run(() => this.setUser(null));
      return true;
    } catch (e) {
      this.zone.run(() => this.setUser(null));
      throw e;
    }
  }
}
