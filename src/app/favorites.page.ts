import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FavoritesService, FavoriteSong } from './services/favorites.service';
import { AuthStateService } from './services/auth-state.service';
import { FavoriteRowComponent } from './favorite-row.component';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FavoriteRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wrap">
      <header class="head">
        <h1>Favoritos</h1>
        <p *ngIf="favorites.length">{{ favorites.length }} elementos</p>
      </header>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <span>Cargando...</span>
      </div>

      <div *ngIf="!loading && !favorites.length" class="empty">
        <h3>Aún no tienes favoritos</h3>
        <p>Presiona el corazón en cualquier canción para agregarla aquí.</p>
        <a routerLink="/discover" class="btn">Explorar música</a>
      </div>

      <div *ngIf="!loading && favorites.length" class="list">
        <app-favorite-row
          *ngFor="let it of favorites"
          [id]="it.song_id"
          [title]="it.song_title"
          [artist]="it.song_artist"
          [cover]="it.song_cover_url"
          [duration]="it.song_duration || 0"
          [onRemove]="onRemoveWithToast"
          (favoriteChanged)="onFavoriteChanged($event)"
        />
      </div>

      <!-- Toast Notificaciones -->
      <div class="toast success" *ngIf="showSuccessToast">
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>
        <span>{{ toastMessage }}</span>
      </div>
      <div class="toast error" *ngIf="showErrorToast">
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
        <span>{{ toastMessage }}</span>
      </div>
    </section>
  `,
  styles: [
    `.wrap{max-width:1100px;margin:0 auto;padding:1.5rem}
    .head{display:flex;align-items:end;justify-content:space-between;margin:1rem 0}
    .head h1{color:#fff;margin:0}
    .head p{color:#a1a1aa;margin:0}
    .loading{display:flex;align-items:center;gap:.5rem;color:#a1a1aa;padding:2rem 0}
    .spinner{width:18px;height:18px;border:3px solid rgba(255,255,255,.18);border-top-color:#6366f1;border-radius:50%;animation:spin 1s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .empty{text-align:center;color:#a1a1aa;padding:3rem 1rem}
    .btn{display:inline-block;margin-top:1rem;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:.6rem 1rem;border-radius:.5rem;text-decoration:none}
    .list{display:flex;flex-direction:column;gap:.5rem}
    .toast {position: fixed; bottom: 2rem; right: 2rem; display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem; border-radius: 12px; color: white; font-weight: 500; z-index: 2000; animation: slideInRight 0.3s ease;} 
    @keyframes slideInRight {from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; }}
    .toast.success { background: linear-gradient(135deg, #22c55e, #16a34a); box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3); }
    .toast.error { background: linear-gradient(135deg, #ef4444, #dc2626); box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3); }
    .toast-icon { width: 20px; height: 20px; }`
  ]
})
export class FavoritesPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private auth = inject(AuthStateService);
  private favoritesSvc = inject(FavoritesService);

  favorites: FavoriteSong[] = [];
  loading = true;

  showSuccessToast = false;
  showErrorToast = false;
  toastMessage = '';

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    if (type === 'success') {
      this.showSuccessToast = true;
      setTimeout(() => this.showSuccessToast = false, 3000);
    } else {
      this.showErrorToast = true;
      setTimeout(() => this.showErrorToast = false, 3000);
    }
  }

  onRemoveWithToast = (id: string) => {
    this.favorites = this.favorites.filter(f => f.song_id !== id);
    this.showToast('Eliminado de favoritos', 'success');
  };
  
  onFavoriteChanged(event: { isFavorite: boolean, success: boolean }) {
    if (!event.success) {
      this.showToast('Error al actualizar favoritos', 'error');
      return;
    }
    this.showToast(event.isFavorite ? 'Agregado a favoritos' : 'Eliminado de favoritos', 'success');
  }

  ngOnInit(): void {
    this.auth.user$.pipe(takeUntil(this.destroy$)).subscribe(u => {
      if (!u) return;
      this.favoritesSvc.getFavorites().pipe(takeUntil(this.destroy$)).subscribe(list => {
        this.favorites = list;
        this.loading = false;
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
