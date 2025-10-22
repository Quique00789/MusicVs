import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-slate-900 text-white">
      <div class="w-full max-w-md p-8 bg-black/60 rounded-lg border border-white/5">
        <h2 class="text-2xl font-bold mb-4">Sign in / Sign up</h2>

        <div class="mb-6">
          <button (click)="onGoogle()" class="w-full py-3 bg-white text-black rounded-lg font-semibold">Continue with Google</button>
        </div>

        <form (submit)="onEmail($event)">
          <label class="block text-sm text-gray-300">Email</label>
          <input type="email" [(ngModel)]="email" name="email" required class="w-full p-3 rounded bg-white/5 mb-3" />

          <label class="block text-sm text-gray-300">Password</label>
          <input type="password" [(ngModel)]="password" name="password" required class="w-full p-3 rounded bg-white/5 mb-4" />

          <div class="flex gap-2">
            <button class="flex-1 py-2 bg-cyan-500 rounded font-semibold" (click)="onSignIn($event)">Sign in</button>
            <button class="flex-1 py-2 bg-blue-600 rounded font-semibold" (click)="onSignUp($event)">Sign up</button>
          </div>
        </form>

        <div *ngIf="error" class="mt-4 text-sm text-red-400">{{ error }}</div>
      </div>
    </div>
  `
})
export class AuthComponent {
  email = '';
  password = '';
  error: string | null = null;

  constructor(private supabase: SupabaseService) {}

  async onGoogle() {
    this.error = null;
    try {
      // Redirect back to '/' after OAuth
      await this.supabase.signInWithGoogle(window.location.origin);
    } catch (e: any) {
      this.error = e.message || String(e);
    }
  }

  async onEmail(e: Event) {
    e.preventDefault();
  }

  async onSignIn(e: Event) {
    e.preventDefault();
    this.error = null;
    try {
      await this.supabase.signInWithEmail(this.email, this.password);
      // After sign-in, you may navigate to the app root or update UI
      window.location.href = '/';
    } catch (err: any) {
      this.error = err.message || String(err);
    }
  }

  async onSignUp(e: Event) {
    e.preventDefault();
    this.error = null;
    try {
      await this.supabase.signUpWithEmail(this.email, this.password);
      // After sign-up, Supabase will send confirmation (if enabled). Redirect to root
      window.location.href = '/';
    } catch (err: any) {
      this.error = err.message || String(err);
    }
  }
}
