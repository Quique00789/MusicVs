import { Component, OnInit, OnDestroy, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStateService } from './services/auth-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 19V6l12-2v13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white cursor-pointer" (click)="goHome()">MusicVs</h1>
        </div>

        <nav class="hidden md:flex items-center gap-8">
          <a routerLink="/" 
             routerLinkActive="active-link"
             [routerLinkActiveOptions]="{exact: true}"
             class="text-gray-300 hover:text-white transition-colors nav-link">Home</a>
          <a routerLink="/discover" 
             routerLinkActive="active-link"
             class="text-gray-300 hover:text-white transition-colors nav-link">Discover</a>
          <a routerLink="/playlists" 
             routerLinkActive="active-link"
             class="text-gray-300 hover:text-white transition-colors nav-link">Playlists</a>
          <a routerLink="/artists" 
             routerLinkActive="active-link"
             class="text-gray-300 hover:text-white transition-colors nav-link">Artists</a>
        </nav>

        <div class="flex items-center gap-4 relative">
          <!-- User Menu (When Logged In) -->
          <ng-container *ngIf="user; else loggedOut">
            <!-- User Avatar and Name -->
            <div class="flex items-center gap-3 cursor-pointer hover:bg-white/10 rounded-lg p-2 transition-colors"
                 (click)="toggleUserMenu()">
              <div class="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <img *ngIf="userAvatar; else avatarFallback" 
                     [src]="userAvatar" 
                     [alt]="userName"
                     class="w-full h-full object-cover">
                <ng-template #avatarFallback>
                  <span class="text-white font-semibold text-sm">{{ getInitials() }}</span>
                </ng-template>
              </div>
              <div class="hidden sm:block text-left">
                <div class="text-white font-medium text-sm truncate max-w-32">{{ userName }}</div>
                <div class="text-gray-400 text-xs truncate max-w-32">{{ userEmail }}</div>
              </div>
              <svg class="w-4 h-4 text-gray-400 transition-transform" 
                   [class.rotate-180]="isUserMenuOpen"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>

            <!-- User Dropdown Menu -->
            <div *ngIf="isUserMenuOpen" 
                 class="absolute top-full right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
              <div class="p-4 border-b border-gray-700">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                    <img *ngIf="userAvatar; else avatarFallbackLarge" 
                         [src]="userAvatar" 
                         [alt]="userName"
                         class="w-full h-full object-cover">
                    <ng-template #avatarFallbackLarge>
                      <span class="text-white font-semibold">{{ getInitials() }}</span>
                    </ng-template>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-white font-medium truncate">{{ userName }}</div>
                    <div class="text-gray-400 text-sm truncate">{{ userEmail }}</div>
                  </div>
                </div>
              </div>
              
              <div class="p-2">
                <button (click)="logout()" 
                        class="w-full flex items-center gap-3 px-3 py-2 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </ng-container>

          <!-- Login Button (When Not Logged In) -->
          <ng-template #loggedOut>
            <a routerLink="/auth" class="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
              Iniciar sesión
            </a>
          </ng-template>

          <!-- Action Buttons -->
          <button class="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hidden sm:block">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>
          
          <!-- Mobile Menu Toggle -->
          <button class="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 md:hidden"
                  (click)="toggleMobileMenu()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Mobile Navigation Menu -->
      <div *ngIf="isMobileMenuOpen" class="md:hidden bg-black/90 backdrop-blur-md border-t border-white/10">
        <nav class="px-6 py-4 space-y-3">
          <a routerLink="/" 
             routerLinkActive="active-mobile-link"
             [routerLinkActiveOptions]="{exact: true}"
             (click)="closeMobileMenu()"
             class="block py-2 text-gray-300 hover:text-white transition-colors">Home</a>
          <a routerLink="/discover" 
             routerLinkActive="active-mobile-link"
             (click)="closeMobileMenu()"
             class="block py-2 text-gray-300 hover:text-white transition-colors">Discover</a>
          <a routerLink="/playlists" 
             routerLinkActive="active-mobile-link"
             (click)="closeMobileMenu()"
             class="block py-2 text-gray-300 hover:text-white transition-colors">Playlists</a>
          <a routerLink="/artists" 
             routerLinkActive="active-mobile-link"
             (click)="closeMobileMenu()"
             class="block py-2 text-gray-300 hover:text-white transition-colors">Artists</a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .nav-link {
      position: relative;
      padding: 0.5rem 0;
    }

    .nav-link:hover {
      color: #06b6d4;
    }

    .active-link {
      color: #06b6d4 !important;
      position: relative;
    }

    .active-link::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #06b6d4, #3b82f6);
      border-radius: 1px;
    }

    .active-mobile-link {
      color: #06b6d4 !important;
      font-weight: 600;
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: any = null;
  isUserMenuOpen = false;
  isMobileMenuOpen = false;
  private unsub?: () => void;

  constructor(
    private authState: AuthStateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    console.log('Header component initializing...');
    
    this.unsub = this.authState.subscribe((u) => {
      console.log('Header received user update:', u?.id || 'none', u?.email || 'no email');
      
      // Ensure we're in Angular zone for proper change detection
      this.ngZone.run(() => {
        this.user = u;
        if (!u) {
          this.isUserMenuOpen = false;
        }
        
        // Force change detection
        this.cdr.detectChanges();
        
        console.log('Header UI updated with user:', this.user?.email || 'none');
      });
    });
  }

  ngOnDestroy() {
    if (this.unsub) {
      this.unsub();
    }
  }

  get userName(): string {
    if (!this.user) return '';
    return this.user.user_metadata?.full_name || 
           this.user.user_metadata?.name || 
           this.user.email?.split('@')[0] || 
           'Usuario';
  }

  get userEmail(): string {
    return this.user?.email || '';
  }

  get userAvatar(): string | null {
    return this.user?.user_metadata?.avatar_url || 
           this.user?.user_metadata?.picture || 
           null;
  }

  getInitials(): string {
    const name = this.userName;
    if (name === 'Usuario') return 'U';
    
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.cdr.detectChanges();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.cdr.detectChanges();
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isUserMenuOpen = false;
      this.cdr.detectChanges();
    }
  }

  goHome() {
    this.router.navigate(['/']);
    this.closeMobileMenu();
  }

  goToArtists() {
    this.router.navigate(['/artists']);
  }

  async logout() {
    this.isUserMenuOpen = false;
    this.cdr.detectChanges();
    
    try {
      console.log('Header: starting logout process...');
      await this.authState.signOut();
      
      console.log('Header: logout successful, redirecting...');
      // Redirect to home after logout
      await this.router.navigate(['/']);
    } catch (error) {
      console.error('Header: error during logout:', error);
    }
  }
}