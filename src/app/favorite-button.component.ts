import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ChangeDetectorRef, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FavoritesService } from './services/favorites.service';
import { AuthStateService } from './services/auth-state.service';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button 
      class="favorite-button"
      [class.is-favorite]="isFavorite"
      [class.loading]="isLoading"
      [disabled]="isLoading || !isAuthenticated"
      (click)="toggleFavorite()"
      [title]="isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'">
      
      <div class="heart-icon" *ngIf="!isLoading">
        <svg width="20" height="20" viewBox="0 0 24 24" [attr.fill]="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      
      <div class="loading-spinner" *ngIf="isLoading">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-dasharray="31.416" stroke-dashoffset="31.416">
            <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
    </button>

    <!-- Toast Notifications -->
    <div class="toast success" *ngIf="showSuccessToast">
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 13l4 4L19 7"/>
      </svg>
      <span>{{ toastMessage }}</span>
    </div>

    <div class="toast error" *ngIf="showErrorToast">
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 18L18 6M6 6l12 12"/>
      </svg>
      <span>{{ toastMessage }}</span>
    </div>
  `,
  styles: [`
    .favorite-button { background: none; border: none; color: #71717a; cursor: pointer; padding: 0.5rem; border-radius: 0.375rem; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; position: relative; width: 40px; height: 40px; }
    .favorite-button:hover:not(:disabled) { color: #ef4444; background: rgba(239, 68, 68, 0.1); transform: scale(1.1); }
    .favorite-button.is-favorite { color: #ef4444; }
    .favorite-button.is-favorite .heart-icon { animation: heartbeat 0.6s ease-in-out; }
    .favorite-button:disabled { cursor: not-allowed; opacity: 0.5; }
    .favorite-button.loading { color: #6366f1; }
    .heart-icon, .loading-spinner { display: flex; align-items: center; justify-content: center; }
    @keyframes heartbeat { 0% { transform: scale(1); } 25% { transform: scale(1.2); } 50% { transform: scale(1); } 75% { transform: scale(1.1); } 100% { transform: scale(1); } }
    .favorite-button.small { width: 32px; height: 32px; padding: 0.375rem; }
    .favorite-button.small svg { width: 16px; height: 16px; }
    .favorite-button.large { width: 48px; height: 48px; padding: 0.75rem; }
    .favorite-button.large svg { width: 24px; height: 24px; }

    /* Toast Notifications (igual que playlist-detail) */
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      color: white;
      font-weight: 500;
      z-index: 2000;
      animation: slideInRight 0.3s ease;
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .toast.success {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
    }

    .toast.error {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
    }

    .toast-icon {
      width: 20px;
      height: 20px;
    }
  `]
})
export class FavoriteButtonComponent implements OnInit, OnDestroy {
  @Input() song!: { id: string; title: string; artist: string; duration?: number; cover?: string; };
  @Input() size: 'small' | 'normal' | 'large' = 'normal';
  @Output() favoriteChanged = new EventEmitter<{ isFavorite: boolean; success: boolean }>();

  private destroy$ = new Subject<void>();
  private favoritesService = inject(FavoritesService);
  private authStateService = inject(AuthStateService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  isFavorite = false;
  isLoading = false;
  isAuthenticated = false;

  // Toast
  showSuccessToast = false;
  showErrorToast = false;
  toastMessage = '';

  ngOnInit() {
    if (!this.song?.id) return;

    this.authStateService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.zone.run(() => {
        this.isAuthenticated = !!user;
        if (user) this.updateFavoriteStatus();
        this.cdr.markForCheck();
      });
    });

    this.favoritesService.favoriteIds$.pipe(takeUntil(this.destroy$)).subscribe(favoriteIds => {
      this.zone.run(() => {
        this.isFavorite = favoriteIds.has(this.song.id);
        this.cdr.markForCheck();
      });
    });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  private updateFavoriteStatus() {
    this.isFavorite = this.favoritesService.isFavorite(this.song.id);
  }

  async toggleFavorite() {
    if (!this.isAuthenticated || this.isLoading) return;

    this.zone.run(() => { this.isLoading = true; this.cdr.markForCheck(); });

    try {
      const result = await this.favoritesService.toggleFavorite(this.song);
      this.zone.run(() => {
        if (result.success) {
          this.isFavorite = result.isFavorite;
          this.favoriteChanged.emit({ isFavorite: result.isFavorite, success: true });
          // Mostrar toast
          this.showToast(
            result.isFavorite ? 'Agregado a favoritos' : 'Eliminado de favoritos',
            'success'
          );
        } else {
          this.favoriteChanged.emit({ isFavorite: this.isFavorite, success: false });
          this.showToast('Error al actualizar favoritos', 'error');
        }
        this.cdr.markForCheck();
      });
    } catch (error) {
      this.zone.run(() => {
        this.favoriteChanged.emit({ isFavorite: this.isFavorite, success: false });
        this.showToast('Error al actualizar favoritos', 'error');
        this.cdr.markForCheck();
      });
    } finally {
      this.zone.run(() => { this.isLoading = false; this.cdr.markForCheck(); });
    }
  }

  // Toast (igual que playlist-detail)
  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    if (type === 'success') {
      this.showSuccessToast = true;
      setTimeout(() => {
        this.showSuccessToast = false;
        this.cdr.markForCheck();
      }, 3000);
    } else {
      this.showErrorToast = true;
      setTimeout(() => {
        this.showErrorToast = false;
        this.cdr.markForCheck();
      }, 3000);
    }
    this.cdr.markForCheck();
  }
}
