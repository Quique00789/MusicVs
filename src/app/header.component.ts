import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStateService } from './services/auth-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 19V6l12-2v13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <h1 class="text-2xl font-bold text-white">SoundWave</h1>
        </div>

        <nav class="hidden md:flex items-center gap-8">
          <a href="#discover" class="text-gray-300 hover:text-white transition-colors">Discover</a>
          <a href="#playlists" class="text-gray-300 hover:text-white transition-colors">Playlists</a>
          <a href="#artists" class="text-gray-300 hover:text-white transition-colors">Artists</a>
        </nav>

        <div class="flex items-center gap-4">
          <ng-container *ngIf="user; else loggedOut">
            <div class="text-gray-200">{{ user.email || user.user_metadata?.full_name || user.user_metadata?.name }}</div>
            <button (click)="logout()" class="ml-3 px-3 py-1 bg-red-600 rounded text-white">Logout</button>
          </ng-container>
          <ng-template #loggedOut>
            <a href="/auth" class="text-gray-300 hover:text-white transition-colors">Login</a>
          </ng-template>

          <button class="p-2 hover:bg-white/6 rounded-full transition-colors text-gray-300">♡</button>
          <button class="p-2 hover:bg-white/6 rounded-full transition-colors text-gray-300">≡</button>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: any = null;
  private unsub?: () => void;

  constructor(private authState: AuthStateService) {}

  ngOnInit() {
    this.unsub = this.authState.subscribe((u) => { this.user = u; });
  }

  ngOnDestroy() {
    if (this.unsub) this.unsub();
  }

  logout() {
    this.authState.signOut();
  }
}

